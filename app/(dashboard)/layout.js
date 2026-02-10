
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-background transition-colors duration-300 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative min-w-0">
                <div className="p-4 md:p-8 pt-20 md:pt-8 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
