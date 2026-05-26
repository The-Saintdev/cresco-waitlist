import WaitlistPage from "./pages/WaitlistPage";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#3d1518",
            color: "#f5e6e0",
            border: "1px solid rgba(88, 66, 53, 0.3)",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "0.875rem",
          },
          success: {
            iconTheme: { primary: "#6fcf97", secondary: "#3d1518" },
          },
          error: {
            iconTheme: { primary: "#ffb4ab", secondary: "#3d1518" },
          },
        }}
      />
      <WaitlistPage />
    </>
  );
}
