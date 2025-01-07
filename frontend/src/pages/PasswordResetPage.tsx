import {PasswordResetForm} from "@/components/PasswordResetForm.tsx";

export default function PasswordResetPage() {
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden bg-gradient-to-bl from-blue-900 to-fuchsia-950 relative">
            {/* Überschrift oben */}
            <h1 className="absolute top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-600 to-cyan-200 bg-clip-text text-transparent font-mono text-3xl md:text-6xl font-bold text-center w-full">
                Help Me Im Stuck!
            </h1>

            {/* Container für LoginForm */}
            <div className="flex items-center justify-center w-full px-4">
                <div className=" w-full max-w-md md:max-w-lg lg:max-w-xl rounded-lg p-6 md:p-10">
                    <PasswordResetForm/>
                </div>
            </div>
        </div>
    );
}