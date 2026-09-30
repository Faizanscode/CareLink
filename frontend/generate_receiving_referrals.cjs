const fs = require('fs');
let content = fs.readFileSync('d:/care connect/frontend/src/pages/Referrals.tsx', 'utf8');

content = content.replace(
  'export const Referrals: React.FC = () => {', 
  `export const ReceivingReferrals: React.FC = () => {
  const useAuth = () => ({ user: { name: 'Dr. Smith', username: 'drsmith', email: 'smith@hospital.com', hospital_id: 1, role: 'ADMIN' }, logout: () => {} });
  const { user } = useAuth();`
);

content = content.replace(
  'const data = await getReferrals(queryParams);', 
  `queryParams.receiving_hospital_id = user.hospital_id.toString();
      const data = await getReferrals(queryParams);`
);

content = content.replace('title="Patient Referrals"', 'title="Incoming Referrals"');
content = content.replace('description="Manage incoming and outgoing patient transfers and referrals."', 'description="Manage incoming patient referrals directed to your facility."');
content = content.replace('onClick={() => navigate(\'/referrals/new\')}', 'onClick={() => {}} className="hidden"');
content = content.replace(/\/referrals\/\$\{referral\.id\}/g, '/receiving-referrals/${referral.id}');

fs.writeFileSync('d:/care connect/frontend/src/pages/ReceivingReferrals.tsx', content);
console.log("ReceivingReferrals.tsx generated.");
