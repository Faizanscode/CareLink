import re

with open('app/api/referrals.py', 'r') as f:
    content = f.read()

# Replace all occurrences of user_id: int = Depends(get_current_user_id) with current_user
content = content.replace('user_id: int = Depends(get_current_user_id)', 'current_user: UserModel = Depends(get_current_active_user)')

# Remove old get_current_user_id calls in body
content = re.sub(r'\s*user = db\.query\(UserModel\)\.filter\(UserModel\.id == user_id\)\.first\(\)\n', '\n', content)
content = re.sub(r'\s*user = db\.query\(UserModel\)\.filter\(UserModel\.id == user\.id\)\.first\(\)\n', '\n', content)

# update_referral
content = content.replace('user_id=user_id', 'user_id=current_user.id')

with open('app/api/referrals.py', 'w') as f:
    f.write(content)
