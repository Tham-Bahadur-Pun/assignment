import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";

type DropDownItemType = { label: string; value: string }

interface Props {
  items: DropDownItemType[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
}

const Dropdown = ({ items, selectedValue, onValueChange, label }: Props) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleSelect = (item: DropDownItemType) => {
    onValueChange(item.value);
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
        style={styles.dropdown}
      >
        <Text style={styles.dropdownText}>
          {items.find((item) => item.value === selectedValue)?.label ||
            "Select an item"}
        </Text>
        <Ionicons
          name={isDropdownVisible ? "chevron-up" : "chevron-down-sharp"}
        />
      </Pressable>

      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={[
                  styles.item,
                  { borderBottomWidth: items.length === index + 1 ? 0 : 1 },
                ]}
              >
                <Text style={[styles.itemText,]}>{item.label}</Text>
                {item.value === selectedValue && <Ionicons name='checkmark-circle' color='green' />}
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  dropdown: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 25,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownContainer: {
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    maxHeight: 200,
    borderRadius: 10,
    position: "absolute",
    right: 0,
    left: 0,
    top: 85,
    zIndex: 1,
  },
  item: {
    padding: 10,
    borderBottomColor: "gray",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 16,
  },
});

export default Dropdown;
