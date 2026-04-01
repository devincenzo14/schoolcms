import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Chatbot from "@/components/public/Chatbot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
