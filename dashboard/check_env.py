import os
from dotenv import load_dotenv

load_dotenv()

required_vars = {
    'DISCORD_TOKEN': 'Your Discord bot token',
    'DISCORD_CLIENT_ID': 'Your Discord application Client ID',
    'DISCORD_CLIENT_SECRET': 'Your Discord application Client Secret',
    'DISCORD_REDIRECT_URI': 'OAuth2 callback URL',
    'FLASK_SECRET_KEY': 'Flask session secret key'
}

print("🔍 Checking environment variables...\n")

missing = []
for var, description in required_vars.items():
    value = os.getenv(var)
    if value:
        print(f"✅ {var}: Set")
    else:
        print(f"❌ {var}: Missing - {description}")
        missing.append(var)

if missing:
    print(f"\n⚠️  {len(missing)} required variable(s) missing!")
    print("\nPlease add these to Replit Secrets:")
    for var in missing:
        print(f"  - {var}: {required_vars[var]}")
    print("\nSee DASHBOARD_SETUP.md for detailed instructions.")
else:
    print("\n✅ All environment variables are set!")
    print("You can now run the dashboard.")
