"use client";

import { useEffect, useState, useRef } from "react";

export function useCountUp(end: number, duration = 800) {
    const [value, setValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const rafId = useRef<number>(0);

    useEffect(() => {
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (startTime.current === null) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(eased * end);

            if (progress < 1) {
                rafId.current = requestAnimationFrame(animate);
            }
        };

        rafId.current = requestAnimationFrame(animate);
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [end, duration]);

    return value;
}
