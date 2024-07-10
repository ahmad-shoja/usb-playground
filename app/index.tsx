import { Button, Dimensions, StyleSheet, TextBase } from "react-native";

import { Text, View } from "../components/Themed";
import {
  UsbSerialManager,
  Parity,
  Codes,
  UsbSerial,
} from "react-native-usb-serialport-for-android";
import { PRODUCT_ID, VENDOR_ID } from "@/constants/Hardware";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import * as ScreenOrientation from "expo-screen-orientation";
import { Chart } from "./chart";

export default function TabOneScreen() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const [usbSerialport, setUsbSerialport] = useState<UsbSerial | null>(null);
  const gaugeLen = 500;
  const [data, setData] = useState<Array<number>>([]);

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

  const open = useCallback(async () => {
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

      const sub = lUsbSerialport.onReceived(({ data: lData }) => {
        const formatted = toNumber(lData);
        setData((prev) => {
          const lenExceed = prev.length > gaugeLen - 1;
          const newVal = lenExceed ? prev.slice(1) : prev;
          return [...newVal, formatted];
        });
      });

      console.log("opened!");
    } catch (err) {
      console.log(err);
      if (err.code === Codes.DEVICE_NOT_FOND) {
        // ...
      }
    }
  }, []);
  const show = useCallback(async () => {
    if (!usbSerialport) console.log("not open!");
    else
      await usbSerialport
        .send(toHex("show"))
        .then((data) => {
          console.log("showing!");
        })
        .catch(console.log);
  }, [usbSerialport]);

  const stop = useCallback(async () => {
    if (!usbSerialport) console.log("not open!");
    else
      usbSerialport
        .send(toHex("stop"))
        .then(() => {
          console.log("stopped!");
        })
        .catch(console.log);
  }, [usbSerialport]);

  const close = useCallback(async () => {
    if (!usbSerialport) console.log("not open!");
    else
      usbSerialport
        .close()
        .then(() => console.log("closed!"))
        .catch(console.log);
  }, [usbSerialport]);
  const Buttons = memo(() => {
    console.log("buttons re rendered");

    return (
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
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <Chart data={data} />
      </View>
      <Buttons />
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
  chart: { flexGrow: 1, height: Dimensions.get("window").height },
});
