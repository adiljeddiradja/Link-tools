
export default function GeckoLogo({ className = "w-8 h-8", color = "currentColor" }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Minimalist Gecko Body */}
            <path
                d="M50 15C50 15 45 25 45 35C45 45 50 55 50 55C50 55 55 45 55 35C55 25 50 15 50 15Z"
                fill={color}
            />
            {/* Tail */}
            <path
                d="M50 55C50 55 48 70 40 85C32 100 50 85 50 85C50 85 68 100 60 85C52 70 50 55 50 55Z"
                fill={color}
                opacity="0.8"
            />
            {/* Legs */}
            <path d="M45 30L30 20M55 30L70 20M45 45L30 55M55 45L70 55" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {/* Fingers/Toes (circles) */}
            <circle cx="30" cy="20" r="3" fill={color} />
            <circle cx="70" cy="20" r="3" fill={color} />
            <circle cx="30" cy="55" r="3" fill={color} />
            <circle cx="70" cy="55" r="3" fill={color} />
            {/* Eyes */}
            <circle cx="48" cy="25" r="1.5" fill="white" />
            <circle cx="52" cy="25" r="1.5" fill="white" />
        </svg>
    )
}
