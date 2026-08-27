import { jobTypeLabel } from '../utils/helpers';
import type { Job } from '../types';

interface Props {
  job: Job;
  onApply: (job: Job) => void;
}

export default function JobCard({ job, onApply }: Props) {
  return (
    <div className="job">
      <div>
        <h4>{job.title}</h4>
        <div className="loc">
          {[job.location, jobTypeLabel(job.type)].filter(Boolean).join(' · ')}
          {job.department ? ` · ${job.department}` : ''}
        </div>
      </div>
      <button className="btn btn-ghost" type="button" onClick={() => onApply(job)}>
        投递
      </button>
    </div>
  );
}
