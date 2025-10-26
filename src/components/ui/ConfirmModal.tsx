import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"

export default function ConfirmModal({
  open, title, message, onCancel, onConfirm, confirmLabel = "Delete", tone = "danger"
}: {
  open: boolean; title: string; message?: string; onCancel: () => void; onConfirm: () => void
  confirmLabel?: string; tone?: "danger" | "primary"
}) {
  const btn = tone === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-indigo-600 hover:bg-indigo-500"
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onCancel} className="relative z-50">
        <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-4">
              <Dialog.Title className="text-base font-semibold text-gray-100">{title}</Dialog.Title>
              {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800">
                  Cancel
                </button>
                <button onClick={onConfirm} className={`px-3 py-2 text-sm rounded-md text-white ${btn}`}>
                  {confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}





