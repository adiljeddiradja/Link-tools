
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-background transition-colors duration-300 md:flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 min-w-0 pl-4 md:pl-8 pt-16 md:pt-8">
                {children}
            </main>
        </div>
    );
}
