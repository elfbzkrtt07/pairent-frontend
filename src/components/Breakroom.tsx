import React from "react";
import DailyIframe from "@daily-co/daily-js";

type BreakroomProps = {
  url: string;
};

export default function Breakroom({ url }: BreakroomProps) {
  React.useEffect(() => {
    // Create iframe
    const iframe = DailyIframe.createFrame({
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "0",
      },
    });

    iframe.join({ url });

    return () => {
      iframe.destroy();
    };
  }, [url]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <p style={{ textAlign: "center" }}>Loading Daily.co Breakroom...</p>
    </div>
  );
}
