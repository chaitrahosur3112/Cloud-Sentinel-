import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "../../store";
import { removeToast } from "../../store/slices/uiSlice";

const colors = {
  success: "bg-green-500",
  error:   "bg-red-500",
  info:    "bg-blue-500",
  warning: "bg-yellow-500",
};

function ToastItem({ id, type, message }: { id: string; type: keyof typeof colors; message: string }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), 4000);
    return () => clearTimeout(timer);
  }, [dispatch, id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0   }}
      exit={{   opacity: 0, x: 48   }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm
        shadow-lg cursor-pointer ${colors[type]}`}
      onClick={() => dispatch(removeToast(id))}
    >
      {message}
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useSelector((s: RootState) => s.ui.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
}