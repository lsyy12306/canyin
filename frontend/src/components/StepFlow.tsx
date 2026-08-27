interface Step {
  title: string;
  desc: string;
}

export default function StepFlow({ steps }: { steps: Step[] }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div className="step" key={i}>
          <div className="num">{i + 1}</div>
          <div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
