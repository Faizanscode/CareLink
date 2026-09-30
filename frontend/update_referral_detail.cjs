const fs = require('fs');
let content = fs.readFileSync('d:/care connect/frontend/src/pages/ReferralDetail.tsx', 'utf8');

content = content.replace(
  'acceptReferral, rejectReferral, cancelReferral,',
  'acceptReferral, rejectReferral, cancelReferral, requestInformationReferral,'
);

content = content.replace(
  'import { MessageCircle } from \'lucide-react\';', // Doesn't exist yet, we will add MessageCircle to lucide imports.
  ''
);
content = content.replace(
  'import { ArrowLeft, CheckCircle, XCircle, PlayCircle, StopCircle, CornerUpLeft } from \'lucide-react\';',
  'import { ArrowLeft, CheckCircle, XCircle, PlayCircle, StopCircle, CornerUpLeft, MessageCircle } from \'lucide-react\';'
);

content = content.replace(
  'export const ReferralDetail: React.FC = () => {',
  'export const ReferralDetail: React.FC<{ isReceiving?: boolean }> = ({ isReceiving = false }) => {'
);

const oldActions = `{/* Action Buttons */}
      <div className="flex space-x-3">
        {referral.status === 'DRAFT' && (
          <button onClick={() => handleAction(submitReferral)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Submit Referral</span>
          </button>
        )}
        {referral.status === 'SUBMITTED' && (
          <button onClick={() => handleAction(startReferralReview)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Start Review</span>
          </button>
        )}
        {referral.status === 'UNDER_REVIEW' && (
          <>
            <button onClick={() => handleAction(acceptReferral)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle size={18} /><span>Accept</span>
            </button>
            <button onClick={handleReject} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <XCircle size={18} /><span>Reject</span>
            </button>
          </>
        )}
        {referral.status === 'ACCEPTED' && (
          <button onClick={() => handleAction(completeReferral)} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <StopCircle size={18} /><span>Complete Transfer</span>
          </button>
        )}
        {(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(referral.status)) && (
          <button onClick={() => handleAction(cancelReferral, 'Are you sure you want to cancel this referral?')} className="flex items-center space-x-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted">
            <CornerUpLeft size={18} /><span>Cancel</span>
          </button>
        )}
      </div>`;

const newActions = `{/* Action Buttons */}
      <div className="flex space-x-3">
        {!isReceiving && referral.status === 'DRAFT' && (
          <button onClick={() => handleAction(submitReferral)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Submit Referral</span>
          </button>
        )}
        
        {isReceiving && referral.status === 'SUBMITTED' && (
          <button onClick={() => handleAction(startReferralReview)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlayCircle size={18} /><span>Start Review</span>
          </button>
        )}
        
        {isReceiving && referral.status === 'UNDER_REVIEW' && (
          <>
            <button onClick={() => handleAction(acceptReferral)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle size={18} /><span>Accept</span>
            </button>
            <button onClick={handleReject} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <XCircle size={18} /><span>Reject</span>
            </button>
            <button onClick={handleRequestInfo} className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              <MessageCircle size={18} /><span>Request Info</span>
            </button>
          </>
        )}
        
        {referral.status === 'ACCEPTED' && (
          <button onClick={() => handleAction(completeReferral)} className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <StopCircle size={18} /><span>Complete Transfer</span>
          </button>
        )}
        
        {!isReceiving && (['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(referral.status)) && (
          <button onClick={() => handleAction(cancelReferral, 'Are you sure you want to cancel this referral?')} className="flex items-center space-x-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted">
            <CornerUpLeft size={18} /><span>Cancel</span>
          </button>
        )}
      </div>`;

content = content.replace(oldActions, newActions);

const requestInfoFn = `
  const handleRequestInfo = async () => {
    if (!referral) return;
    const msg = prompt("Please enter the information you are requesting:");
    if (msg === null) return;
    if (msg.trim() === '') {
      alert("Message is required.");
      return;
    }
    
    try {
      await requestInformationReferral(referral.id, msg);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };
`;

content = content.replace(
  'const handleReject = async () => {',
  requestInfoFn + '\n  const handleReject = async () => {'
);

fs.writeFileSync('d:/care connect/frontend/src/pages/ReferralDetail.tsx', content);
console.log("ReferralDetail updated successfully.");
