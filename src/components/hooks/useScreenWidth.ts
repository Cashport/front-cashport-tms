import { useEffect, useState } from "react";

const useScreenWidth = () => {
  const [width, setWidth] = useState<number>(); // null en SSR

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setWidth(window.innerWidth);
      setWidth(window.innerWidth); // Inicializar
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return width;
};

export default useScreenWidth;
