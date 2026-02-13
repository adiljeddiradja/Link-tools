
export default function GeckoLogo({ className = "w-32 h-20", color = "#6366f1" }) {
    return (
        <svg
            viewBox="0 0 120 60"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Horizontal Ledge Line */}
            <path d="M0 45H120" stroke="currentColor" strokeWidth="1" className="opacity-20" />

            {/* Peeking Head */}
            <path
                d="M40 45C40 30 45 20 60 20C75 20 80 30 80 45"
                fill={color}
            />

            {/* Large Peeking Eyes */}
            <circle cx="50" cy="25" r="14" fill="white" stroke="black" strokeWidth="0.5" />
            <circle cx="70" cy="25" r="14" fill="white" stroke="black" strokeWidth="0.5" />

            {/* Pupils peeking down */}
            <circle cx="50" cy="30" r="5" fill="black" />
            <circle cx="70" cy="30" r="5" fill="black" />

            {/* Highlight in eyes */}
            <circle cx="52" cy="28" r="1.5" fill="white" />
            <circle cx="72" cy="28" r="1.5" fill="white" />

            {/* Left Hand/Fingers Peeking */}
            <g fill={color} stroke="black" strokeWidth="0.5">
                <rect x="15" y="35" width="6" height="15" rx="3" />
                <rect x="22" y="32" width="6" height="18" rx="3" />
                <rect x="29" y="35" width="6" height="15" rx="3" />
            </g>

            {/* Right Hand/Fingers Peeking */}
            <g fill={color} stroke="black" strokeWidth="0.5">
                <rect x="85" y="35" width="6" height="15" rx="3" />
                <rect x="92" y="32" width="6" height="18" rx="3" />
                <rect x="99" y="35" width="6" height="15" rx="3" />
            </g>
        </svg>
    )
}
