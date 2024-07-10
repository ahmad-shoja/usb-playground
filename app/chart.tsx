import { LineChart, Grid } from "react-native-svg-charts";

type PropTypes = {
  data: Array<number>;
};
export const Chart = ({ data }: PropTypes) => {
  return (
    <LineChart
      style={{ height: 200, with: 200 }}
      data={data}
      svg={{ stroke: "rgb(134, 65, 244)" }}
      contentInset={{ top: 20, bottom: 20 }}
    >
      <Grid />
    </LineChart>
  );
};
