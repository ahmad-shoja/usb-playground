import StreamChart from "./StreamChart";
import { lockAsync, OrientationLock } from "expo-screen-orientation";
import { Button, Dimensions, StyleSheet } from "react-native";
import { View } from "react-native";
import {
  UsbSerialManager,
  Parity,
  Codes,
  UsbSerial,
} from "react-native-usb-serialport-for-android";
import { PRODUCT_ID, VENDOR_ID } from "@/constants/Hardware";
import { memo, useCallback, useEffect, useState } from "react";
import { toHex } from "./utility/hex";
const Main = () => {
  const [usbSerialport, setUsbSerialport] = useState<UsbSerial | null>(null);

  useEffect(() => {
    lockAsync(OrientationLock.LANDSCAPE);
  }, []);

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

      console.log("opened!");
    } catch (err) {
      console.log(err);
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
          height: 300,
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
        <StreamChart usbSerial={usbSerialport} />
      </View>
      <Buttons />
    </View>
  );
};

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

export default Main;
