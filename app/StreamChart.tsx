
import {
  UsbSerial
} from "react-native-usb-serialport-for-android";
import { useEffect } from "react";
import { Chart } from "../components/chart";
import { useDebouncedChartDataUpdate } from "./Hooks/useDebouncedChartDataUpdate";
import { toNumber } from "./utility/hex";
type PropsType = {
  usbSerial: UsbSerial | null;
};

export default function StreamChart({ usbSerial }: PropsType) {
  useEffect(() => {
    console.log("StreamChart rerendered");
  }, []);

  useEffect(() => {
    if (usbSerial) usbSerial.onReceived(onDataReceived);
  }, [usbSerial]);

  const { state: data, addData } = useDebouncedChartDataUpdate(1, 400);

  //@ts-ignore
  const onDataReceived = ({ data: lData }) => {
    const formatted = toNumber(lData);
    addData(formatted);
  };

  return <Chart data={data} />;
}
