import os
import json
import secrets
import time
from flask import Flask, render_template, session, redirect, request, url_for, jsonify
from dotenv import load_dotenv
import requests
from datetime import datetime, timedelta
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here-change-this')

DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = os.getenv('DISCORD_REDIRECT_URI', 'http://localhost:5000/callback')
DISCORD_BOT_TOKEN = os.getenv('DISCORD_TOKEN')
OWNER_IDS = {'1392792427051614249', '1229657759717523487'}
if os.getenv('OWNER_ID'):
    OWNER_IDS.add(os.getenv('OWNER_ID'))

if not DISCORD_CLIENT_ID or not DISCORD_CLIENT_SECRET:
    print("⚠️  WARNING: Discord OAuth credentials not configured!")
    print("Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in Secrets")

DISCORD_API_URL = 'https://discord.com/api/v10'
OAUTH2_URL = f'{DISCORD_API_URL}/oauth2/authorize'
TOKEN_URL = f'{DISCORD_API_URL}/oauth2/token'

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

token_cache = {}

def load_json_data(filename, default=None):
    filepath = os.path.join(DATA_PATH, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filename}: {e}")
    return default if default is not None else {}

def save_json_data(filename, data):
    filepath = os.path.join(DATA_PATH, filename)
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving {filename}: {e}")
        return False

def get_bot_info():
    if not DISCORD_BOT_TOKEN:
        print("⚠️  Bot token not configured")
        return None
    try:
        headers = {'Authorization': f'Bot {DISCORD_BOT_TOKEN}'}
        response = requests.get(f'{DISCORD_API_URL}/users/@me', headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Bot info request failed: {response.status_code}")
    except Exception as e:
        print(f"Error getting bot info: {e}")
    return None

def get_bot_guilds():
    if not DISCORD_BOT_TOKEN:
        print("⚠️  Bot token not configured")
        return []
    try:
        headers = {'Authorization': f'Bot {DISCORD_BOT_TOKEN}'}
        response = requests.get(f'{DISCORD_API_URL}/users/@me/guilds', headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Bot guilds request failed: {response.status_code}")
    except Exception as e:
        print(f"Error getting bot guilds: {e}")
    return []

def get_user_guilds(access_token):
    try:
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f'{DISCORD_API_URL}/users/@me/guilds', headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"User guilds request failed: {response.status_code}")
    except Exception as e:
        print(f"Error getting user guilds: {e}")
    return []

def get_guild_channels(guild_id):
    if not DISCORD_BOT_TOKEN:
        return []
    try:
        headers = {'Authorization': f'Bot {DISCORD_BOT_TOKEN}'}
        response = requests.get(f'{DISCORD_API_URL}/guilds/{guild_id}/channels', headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Guild channels request failed: {response.status_code}")
    except Exception as e:
        print(f"Error getting guild channels: {e}")
    return []

def get_guild_roles(guild_id):
    if not DISCORD_BOT_TOKEN:
        return []
    try:
        headers = {'Authorization': f'Bot {DISCORD_BOT_TOKEN}'}
        response = requests.get(f'{DISCORD_API_URL}/guilds/{guild_id}/roles', headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Guild roles request failed: {response.status_code}")
    except Exception as e:
        print(f"Error getting guild roles: {e}")
    return []

def has_manage_guild_permission(guild):
    MANAGE_GUILD = 0x00000020
    permissions = int(guild.get('permissions', 0))
    return (permissions & MANAGE_GUILD) == MANAGE_GUILD or (permissions & 0x00000008) == 0x00000008

def get_user_token():
    session_id = session.get('session_id')
    if not session_id:
        return None
    
    token_data = token_cache.get(session_id)
    if not token_data:
        return None
    
    if time.time() > token_data['expires_at']:
        token_cache.pop(session_id, None)
        return None
    
    return token_data['token']

def store_user_token(token):
    if 'session_id' not in session:
        session['session_id'] = secrets.token_urlsafe(32)
    
    session_id = session['session_id']
    token_cache[session_id] = {
        'token': token,
        'expires_at': time.time() + 3600
    }

def clear_user_token():
    session_id = session.get('session_id')
    if session_id:
        token_cache.pop(session_id, None)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('home'))
    return redirect(url_for('login'))

@app.route('/login')
def login():
    if 'user' in session:
        return redirect(url_for('home'))
    
    if not DISCORD_CLIENT_ID:
        return "OAuth2 not configured. Please set DISCORD_CLIENT_ID in environment variables.", 500
    
    state = secrets.token_urlsafe(32)
    session['oauth_state'] = state
    
    oauth_url = (
        f"{OAUTH2_URL}?"
        f"client_id={DISCORD_CLIENT_ID}&"
        f"redirect_uri={DISCORD_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=identify+guilds&"
        f"state={state}"
    )
    return render_template('login.html', oauth_url=oauth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    state = request.args.get('state')
    
    if not code:
        return redirect(url_for('login'))
    
    if state != session.get('oauth_state'):
        print("⚠️  OAuth state mismatch - possible CSRF attack")
        return redirect(url_for('login'))
    
    session.pop('oauth_state', None)
    
    if not DISCORD_CLIENT_ID or not DISCORD_CLIENT_SECRET:
        return "OAuth2 not configured properly", 500
    
    data = {
        'client_id': DISCORD_CLIENT_ID,
        'client_secret': DISCORD_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': DISCORD_REDIRECT_URI
    }
    
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    try:
        response = requests.post(TOKEN_URL, data=data, headers=headers, timeout=10)
        response.raise_for_status()
        token_data = response.json()
        
        access_token = token_data.get('access_token')
        if not access_token:
            raise ValueError("No access token received")
        
        user_headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(f'{DISCORD_API_URL}/users/@me', headers=user_headers, timeout=5)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        if not user_data or 'id' not in user_data:
            raise ValueError("Invalid user data received")
        
        session['user'] = user_data
        store_user_token(access_token)
        
        return redirect(url_for('home'))
    except Exception as e:
        print(f"OAuth error: {e}")
        return "Authentication failed. Please try again.", 500

@app.route('/home')
@login_required
def home():
    user = session.get('user')
    if not user or 'id' not in user:
        session.clear()
        return redirect(url_for('login'))
    
    bot_info = get_bot_info()
    bot_guilds = get_bot_guilds()
    
    admins = load_json_data('admins.json', [])
    is_admin = user.get('id') in admins or user.get('id') in OWNER_IDS
    
    if not is_admin:
        return render_template('unauthorized.html', user=user)
    
    total_members = sum(guild.get('approximate_member_count', 0) for guild in bot_guilds) if bot_guilds else 0
    
    stats = {
        'server_count': len(bot_guilds) if bot_guilds else 0,
        'user_count': total_members if total_members > 0 else 'N/A',
        'status': 'Online' if bot_info else 'Offline'
    }
    
    return render_template('home.html', user=user, bot_info=bot_info, stats=stats)

@app.route('/commands')
@login_required
def commands():
    user = session.get('user')
    if not user or 'id' not in user:
        session.clear()
        return redirect(url_for('login'))
    
    access_token = get_user_token()
    if not access_token:
        return redirect(url_for('login'))
    
    bot_guilds = get_bot_guilds()
    user_guilds = get_user_guilds(access_token)
    
    bot_guild_ids = {g.get('id') for g in bot_guilds if g.get('id')}
    managed_guilds = [g for g in user_guilds if g.get('id') in bot_guild_ids and has_manage_guild_permission(g)]
    
    disabled_commands = load_json_data('disabledCommands.json', {})
    
    command_categories = {
        'giveaways': ['gstart', 'gend', 'box', 'winners'],
        'wheel': ['wheelticket', 'invites', 'addpoints', 'setinvitelog', 'addreward', 'removereward', 'listrewards'],
        'greetings': ['greet', 'setgreet', 'greetduration', 'testgreet'],
        'moderation': ['ban', 'unban', 'clear', 'mute', 'unmute'],
        'autoline': ['setline', 'toggleline', 'addlinechannel', 'removelinechannel'],
        'feedback': ['addfeedbackchannel', 'removefeedbackchannel', 'setfeedbackemojis', 'togglefeedback'],
        'jail': ['اسجن', 'عفو', 'setjailchat', 'setjaillog', 'setjailstaff', 'jaillist'],
        'channels': ['hide', 'show'],
        'admin': ['addadmin', 'removeadmin', 'blacklist', 'servers']
    }
    
    return render_template('commands.html', user=user, guilds=managed_guilds, 
                         disabled_commands=disabled_commands, command_categories=command_categories)

@app.route('/moderation')
@login_required
def moderation():
    user = session.get('user')
    if not user or 'id' not in user:
        session.clear()
        return redirect(url_for('login'))
    
    access_token = get_user_token()
    if not access_token:
        return redirect(url_for('login'))
    
    bot_guilds = get_bot_guilds()
    user_guilds = get_user_guilds(access_token)
    
    bot_guild_ids = {g.get('id') for g in bot_guilds if g.get('id')}
    managed_guilds = [g for g in user_guilds if g.get('id') in bot_guild_ids and has_manage_guild_permission(g)]
    
    greetings = load_json_data('greetings.json', {})
    auto_line = load_json_data('autoLine.json', {})
    feedback = load_json_data('feedback.json', {})
    jail_config = load_json_data('jailConfig.json', {})
    
    return render_template('moderation.html', user=user, guilds=managed_guilds,
                         greetings=greetings, auto_line=auto_line, 
                         feedback=feedback, jail_config=jail_config)

@app.route('/servers')
@login_required
def servers():
    user = session.get('user')
    if not user or 'id' not in user:
        session.clear()
        return redirect(url_for('login'))
    
    access_token = get_user_token()
    if not access_token:
        return redirect(url_for('login'))
    
    bot_guilds = get_bot_guilds()
    user_guilds = get_user_guilds(access_token)
    
    bot_guild_ids = {g.get('id') for g in bot_guilds if g.get('id')}
    managed_guilds = [g for g in user_guilds if g.get('id') in bot_guild_ids and has_manage_guild_permission(g)]
    
    return render_template('servers.html', user=user, guilds=managed_guilds)

@app.route('/server/<guild_id>')
@login_required
def server_detail(guild_id):
    user = session.get('user')
    if not user or 'id' not in user:
        session.clear()
        return redirect(url_for('login'))
    
    access_token = get_user_token()
    if not access_token:
        return redirect(url_for('login'))
    
    user_guilds = get_user_guilds(access_token)
    bot_guilds = get_bot_guilds()
    
    bot_guild_ids = {g.get('id') for g in bot_guilds if g.get('id')}
    user_guild = next((g for g in user_guilds if g.get('id') == guild_id), None)
    
    if not user_guild or guild_id not in bot_guild_ids or not has_manage_guild_permission(user_guild):
        return "Unauthorized", 403
    
    channels = get_guild_channels(guild_id)
    roles = get_guild_roles(guild_id)
    
    greetings = load_json_data('greetings.json', {})
    server_settings = greetings.get(guild_id, {})
    
    return render_template('server_detail.html', user=user, guild=user_guild,
                         channels=channels, roles=roles, settings=server_settings)

@app.route('/user')
@login_required
def user_page():
    user = session.get('user')
    return render_template('user.html', user=user)

@app.route('/logout')
def logout():
    clear_user_token()
    session.clear()
    return redirect(url_for('login'))

@app.route('/api/stats')
@login_required
def api_stats():
    bot_info = get_bot_info()
    bot_guilds = get_bot_guilds()
    
    return jsonify({
        'bot_name': bot_info.get('username', 'SkillSparkHub') if bot_info else 'SkillSparkHub',
        'bot_avatar': f"https://cdn.discordapp.com/avatars/{bot_info['id']}/{bot_info['avatar']}.png" if bot_info and bot_info.get('avatar') else '',
        'server_count': len(bot_guilds),
        'status': 'online' if bot_info else 'offline'
    })

@app.route('/api/servers')
@login_required
def api_servers():
    access_token = get_user_token()
    if not access_token:
        return jsonify({'error': 'Not authenticated'}), 401
    
    bot_guilds = get_bot_guilds()
    user_guilds = get_user_guilds(access_token)
    
    bot_guild_ids = {g.get('id') for g in bot_guilds if g.get('id')}
    managed_guilds = [
        {
            'id': g.get('id'),
            'name': g.get('name', 'Unknown'),
            'icon': f"https://cdn.discordapp.com/icons/{g.get('id')}/{g.get('icon')}.png" if g.get('icon') else None
        }
        for g in user_guilds if g.get('id') in bot_guild_ids and has_manage_guild_permission(g)
    ]
    
    return jsonify(managed_guilds)

@app.route('/api/commands/<guild_id>', methods=['GET', 'POST'])
@login_required
def api_commands(guild_id):
    if request.method == 'POST':
        data = request.json
        command_name = data.get('command')
        enabled = data.get('enabled', True)
        
        disabled_commands = load_json_data('disabledCommands.json', {})
        
        if guild_id not in disabled_commands:
            disabled_commands[guild_id] = []
        
        if enabled and command_name in disabled_commands[guild_id]:
            disabled_commands[guild_id].remove(command_name)
        elif not enabled and command_name not in disabled_commands[guild_id]:
            disabled_commands[guild_id].append(command_name)
        
        save_json_data('disabledCommands.json', disabled_commands)
        
        return jsonify({'success': True})
    
    disabled_commands = load_json_data('disabledCommands.json', {})
    return jsonify(disabled_commands.get(guild_id, []))

@app.route('/api/settings/<guild_id>', methods=['GET', 'POST'])
@login_required
def api_settings(guild_id):
    if request.method == 'POST':
        data = request.json
        setting_type = data.get('type')
        
        if setting_type == 'greeting':
            greetings = load_json_data('greetings.json', {})
            greetings[guild_id] = {
                'enabled': data.get('enabled', False),
                'channelId': data.get('channelId'),
                'message': data.get('message'),
                'duration': data.get('duration', 0)
            }
            save_json_data('greetings.json', greetings)
        
        elif setting_type == 'autoline':
            auto_line = load_json_data('autoLine.json', {})
            auto_line[guild_id] = {
                'enabled': data.get('enabled', False),
                'imageUrl': data.get('imageUrl'),
                'channels': data.get('channels', [])
            }
            save_json_data('autoLine.json', auto_line)
        
        elif setting_type == 'feedback':
            feedback = load_json_data('feedback.json', {})
            feedback[guild_id] = {
                'enabled': data.get('enabled', False),
                'channels': data.get('channels', []),
                'emojis': data.get('emojis', ['👍', '👎'])
            }
            save_json_data('feedback.json', feedback)
        
        return jsonify({'success': True})
    
    greetings = load_json_data('greetings.json', {})
    auto_line = load_json_data('autoLine.json', {})
    feedback = load_json_data('feedback.json', {})
    
    return jsonify({
        'greeting': greetings.get(guild_id, {}),
        'autoline': auto_line.get(guild_id, {}),
        'feedback': feedback.get(guild_id, {})
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
