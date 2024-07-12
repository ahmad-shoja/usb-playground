import { useRef, useState } from "react";

export const useDebouncedChartDataUpdate = (
  gaugeLen: number = 100,
  stateLen: number = 500
) => {
  const [state, setState] = useState<Array<number>>([]);
  const gauge = useRef<Array<number>>([]);
  const addData = (data: number) => {
    if (gauge.current.length >= gaugeLen) {
      const stateGaugeLen = stateLen - gaugeLen;
      setState((prev) => {
        return [...prev.slice(-stateGaugeLen), ...gauge.current];
      });
      gauge.current = [];
    } else {
      gauge.current.push(data);
    }
  };
  return {state, addData};
};
