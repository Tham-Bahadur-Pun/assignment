import Dropdown from "@/components/Dropdown";
import axios from "axios";
import { camelCase, chain, flatMap, forEach, get, keys, mapKeys } from "lodash";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const filters = [
  { label: "OPEN", value: "open" },
  { label: "CLOSE", value: "close" },
  { label: "LOW", value: "low" },
  { label: "HIGH", value: "high" },
];

const companies = [
  { label: "IBM", value: "IBM" },
  { label: "MSFT", value: "MSFT" },
];

export default function Index() {
  const [company, setCompany] = useState<string>("IBM");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("open");
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
    value: number;
  }>({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const [dataSets, setDataSets] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${company}&apikey=demo`
      );

      // Get Only Weekly Adjusted Time Series data
      const data = get(response.data, "Weekly Adjusted Time Series", {});

      const filteredData = chain(data)
        .mapValues((obj) => {
          const newObj: any = {};
          forEach(obj, (value, key) => {
            const newKey = key.replace(/^\d+\.\s*/, "");
            newObj[newKey] = value;
          });
          return newObj;
        })
        .mapValues((obj) => mapKeys(obj, (value, key) => camelCase(key)))
        .value();

      const minimizedData = keys(filteredData).filter((label, index) => (index % 100 === 0) )

      setLabels(minimizedData);

      const combinedData = flatMap(filteredData, (entry) => {
        return [parseFloat(entry[filter])];
      }).filter((data, index)=> index % 20 === 0);

      setDataSets(combinedData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTooltipPos({
      x: 0,
      y: 0,
      visible: false,
      value: 0,
    })
    fetchData();
  }, [company, filter]);

  const data = {
    labels,
    datasets: [
      {
        data: dataSets,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 6,
      },
    ],
    legend: ["Weekly Adjusted Prices and Volumes"],
  };
  const chartConfig = {
    backgroundGradientFrom: "#1E2921",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 0.6) => `rgba(26, 80, 100, ${opacity})`,
    strokeWidth: 10,
    barPercentage: 0.5,
    useShadowColorFromDataset: true,
    propsForDots: {
      r: "6",
      strokeWidth: "1",
      stroke: "rgba(26,80,100,0.6)"
    },
  };
  const screenWidth = Dimensions.get("window").width;

  const handleDataPointClick = (data: any) => {
    setTooltipPos({ x: data.x, y: data.y, visible: true, value: data.value });
  };
  return (
    <SafeAreaView
      style={[styles.container, isLoading && styles.verticalCenter]}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <View>
          <View style={styles.dropdowns}>
            <View style={{ flex: 1 }}>
              <Dropdown
                items={companies}
                selectedValue={company}
                onValueChange={setCompany}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                items={filters}
                selectedValue={filter}
                onValueChange={setFilter}
              />
            </View>
          </View>

          <ScrollView horizontal>
            <LineChart
              data={data}
              width={screenWidth}
              height={520}
              chartConfig={chartConfig}
              horizontalLabelRotation={20}
              verticalLabelRotation={80}
              segments={6}
              xLabelsOffset={10}
              yLabelsOffset={20}
              onDataPointClick={handleDataPointClick}
              style={{
                borderRadius: 16,
              }}
            />
            {tooltipPos.visible && (
              <View
                style={[
                  styles.tooltip,
                  {
                    position: "absolute",
                    left: tooltipPos.x - 15,
                    top: tooltipPos.y + 45,
                  },
                ]}
              >
                <Text style={styles.tooltipText}>{tooltipPos.value}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 10,
  },
  verticalCenter: {
    justifyContent: "center",
  },
  dropdowns: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 80,
  },
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 5,
    padding: 5,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});
