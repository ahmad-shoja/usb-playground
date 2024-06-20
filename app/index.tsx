import { Button, Dimensions, StyleSheet, TextBase } from "react-native";

import { Text, View } from "../components/Themed";
import {
  UsbSerialManager,
  Parity,
  Codes,
  UsbSerial,
} from "react-native-usb-serialport-for-android";
import { PRODUCT_ID, VENDOR_ID } from "@/constants/Hardware";
import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import * as ScreenOrientation from "expo-screen-orientation";

export default function TabOneScreen() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const [usbSerialport, setUsbSerialport] = useState<UsbSerial | null>(null);

  const gaugeLen = 200;
  const gauge = useRef<Array<number>>(new Array(gaugeLen).fill(0));
  const chartRef = useRef<LineChart | null>(null);

  const chartUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const toNumber = (hexStr: string) => {
    const removeLeadingNewLine = (str: string) => str.replace(/^(0A)/, "");
    const removedTailingNulls = (str: string) => str.replace(/0+$/, "");

    const ascii = removeLeadingNewLine(removedTailingNulls(hexStr))
      .match(/.{2,2}/g)
      ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join("");

    return Number(ascii);
  };
  const toHex = (string: string) =>
    string
      .split("")
      .map((ch) => ch.charCodeAt(0).toString(16))
      .join("");

  const open = async () => {
    const devices = await UsbSerialManager.list();
    const thDevice = devices.find(
      ({ productId, vendorId }) =>
        productId === PRODUCT_ID && vendorId === VENDOR_ID
    );

    try {
      if (!thDevice) throw new Error(Codes.DEVICE_NOT_FOND);
      await UsbSerialManager.tryRequestPermission(thDevice.deviceId);
      const lUsbSerialport = await UsbSerialManager.open(thDevice.deviceId, {
        baudRate: 38400,
        parity: Parity.None,
        dataBits: 8,
        stopBits: 1,
      });

      setUsbSerialport(lUsbSerialport);

      const sub = lUsbSerialport.onReceived(({ data }) => {
        const formatted = toNumber(data);
        if (gauge.current.length > gaugeLen - 1)
          gauge.current = gauge.current.slice(1);
        gauge.current.push(formatted);
      });

      console.log("opened!");
    } catch (err) {
      console.log(err);
      if (err.code === Codes.DEVICE_NOT_FOND) {
        // ...
      }
    }
  };

  const stopChartUpdate = () => {
    if (chartUpdateInterval.current) clearInterval(chartUpdateInterval.current);
  };
  const startChartUpdate = () => {
    stopChartUpdate();
    chartUpdateInterval.current = setInterval(() => {
      if (chartRef.current) {
        chartRef.current;
      }
    }, 1000);
  };

  const show = async () => {
    if (!usbSerialport) console.log("not open!");
    else
      await usbSerialport
        .send(toHex("show"))
        .then((data) => {
          startChartUpdate();
          console.log("sent!");
        })
        .catch(console.log);
  };
  const stop = async () => {
    if (!usbSerialport) console.log("not open!");
    else
      usbSerialport
        .send(toHex("stop"))
        .then(() => {
          stopChartUpdate();
          console.log("sent!");
        })
        .catch(console.log);
  };
  const close = async () => {
    if (!usbSerialport) console.log("not open!");
    else
      usbSerialport
        .close()
        .then(() => console.log("closed!"))
        .catch(console.log);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexGrow: 1, height: Dimensions.get("window").height }}>
        <LineChart
          ref={chartRef}
          data={{
            labels: Array.from({ length: 16 }, (_, i) => (i * 64).toString()),
            datasets: [
              {
                data: gauge.current,
              },
            ],
          }}
          width={700} // from react-native
          height={Dimensions.get("window").height}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={10} // optional, defaults to 1
          chartConfig={{
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "1",
              strokeWidth: "1",
              stroke: "#ffffff",
            },
          }}
          style={{}}
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          gap: 4,
          flexShrink: 0,
          justifyContent: "center",
          height: Dimensions.get("window").height,
        }}
      >
        <Button title="open" onPress={open} />
        <Button title="show" onPress={show} />
        <Button title="stop" onPress={stop} />
        <Button title="close" onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
