import { CloudRain, Backpack, Clock, AlertTriangle } from 'lucide-react';

const IssueCard = ({ issue }) => {
  // Map type to icon
  let Icon = AlertTriangle;
  if (issue.type === 'weather') Icon = CloudRain;
  if (issue.type === 'gear') Icon = Backpack;
  if (issue.type === 'time') Icon = Clock;
  
  const severityClass = `severity-${issue.severity.toLowerCase()}`;

  return (
    <div className={`issue-card ${severityClass}`}>
      <div className="issue-icon">
        <Icon size={20} />
      </div>
      <div className="issue-content">
        <div className="issue-severity">{issue.severity} {issue.type} risk</div>
        <p className="issue-text">{issue.text}</p>
      </div>
    </div>
  );
};

export default IssueCard;
