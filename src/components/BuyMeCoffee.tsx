"use client";

import { useState } from "react";

export default function BuyMeCoffee() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://buymeacoffee.com/dsgoose"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-300 hover:shadow-xl active:scale-95"
      aria-label="Buy me a coffee"
    >
      {/* Cute coffee cup */}
      <span className="text-2xl" role="img" aria-label="coffee">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-sm"
        >
          {/* Steam lines */}
          <path
            d="M8 3C8 3 8.5 1 10 1.5C11.5 2 11 3.5 11 3.5"
            stroke="#8B6914"
            strokeWidth="1.2"
            strokeLinecap="round"
            className={hovered ? "animate-bounce" : ""}
          />
          <path
            d="M12 2.5C12 2.5 12.5 0.5 14 1C15.5 1.5 15 3 15 3"
            stroke="#8B6914"
            strokeWidth="1.2"
            strokeLinecap="round"
            className={hovered ? "animate-bounce" : ""}
            style={{ animationDelay: "0.1s" }}
          />
          {/* Cup body */}
          <rect
            x="4"
            y="6"
            width="14"
            height="12"
            rx="2"
            fill="#FFFFFF"
            stroke="#8B6914"
            strokeWidth="1.5"
          />
          {/* Coffee fill */}
          <rect
            x="5.5"
            y="9"
            width="11"
            height="7.5"
            rx="1"
            fill="#C4A35A"
          />
          {/* Cup handle */}
          <path
            d="M18 9.5C19.5 9.5 21 10.5 21 12.5C21 14.5 19.5 15.5 18 15.5"
            stroke="#8B6914"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Saucer */}
          <ellipse
            cx="11"
            cy="20"
            rx="8"
            ry="1.5"
            fill="#8B6914"
            opacity="0.2"
          />
          {/* Heart in coffee */}
          <path
            d="M9.5 12C9.5 11.2 10.2 10.5 11 10.5C11.8 10.5 12.5 11.2 12.5 12C12.5 11.2 13.2 10.5 14 10.5C14.8 10.5 15.5 11.2 15.5 12C15.5 13.5 12.5 15 12.5 15C12.5 15 9.5 13.5 9.5 12Z"
            fill="#E85D75"
            opacity="0.7"
          />
        </svg>
      </span>

      {/* Text - shows on hover with smooth expand */}
      <span
        className={`overflow-hidden whitespace-nowrap text-sm font-bold text-yellow-900 transition-all duration-300 ${
          hovered ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        Buy me a coffee
      </span>
    </a>
  );
}
