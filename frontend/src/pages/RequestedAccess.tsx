import ClockIcon from "src/assets/icons/ClockIcon";

export default function RequestedAccess() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm px-4 text-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-100">
            <ClockIcon className="w-7 h-7 text-violet-600" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Request pending
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Your request is waiting for approval by the admins. You'll be
              notified once your access has been granted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
