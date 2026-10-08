import { Link } from "react-router-dom";

export function Placeholder() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-24 text-center">
      <h1 className="text-[16px] font-semibold">This Portal page isn't part of the pKYB prototype</h1>
      <p className="mt-1 text-[14px] text-content-main">The flow covers Search, Choose report, Monitoring and Severity Settings.</p>
      <Link to="/pkyb/monitoring" className="mt-4 inline-block font-semibold text-content-link hover:underline">
        Go to Monitoring
      </Link>
    </div>
  );
}
