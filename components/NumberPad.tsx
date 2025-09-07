import React, { memo, useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Eraser } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const COLS = 5;  // cantidad de botones por fila
const GAP = 12;  // mismo valor que en styles.numbersRow.gap

interface NumberPadProps {
  onNumberSelect: (number: number) => void;
  selectedNumber: number;
  disabled: boolean;
  availableNumbers?: number[];
}

const NumberPad = memo(function NumberPad({ 
  onNumberSelect, 
  selectedNumber, 
  disabled, 
  availableNumbers = [] 
}: NumberPadProps) {

  const [containerWidth, setContainerWidth] = useState<number>(width);

  // Calculamos el tamaño exacto de cada botón
  const buttonSize = useMemo(() => {
    const gapsWidth = GAP * (COLS - 1);
    return Math.floor((containerWidth - gapsWidth) / COLS);
  }, [containerWidth]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const renderNumberButton = useCallback((number: number) => {
    const isSelected = selectedNumber === number;
    const isAvailable = availableNumbers.length === 0 || availableNumbers.includes(number);
    const isDisabled = disabled || !isAvailable;

    return (
      <TouchableOpacity
        key={number}
        onPress={() => onNumberSelect(number)}
        disabled={isDisabled}
        activeOpacity={0.7}
        testID={`number-${number}`}
      >
        <View
          style={[
            styles.numberButton,
            { width: buttonSize, height: buttonSize },
            isSelected && styles.selectedNumberButton,
            isDisabled && styles.disabledButton,
            !isAvailable && styles.unavailableButton,
          ]}
        >
          <Text style={[
            styles.numberText,
            isSelected && styles.selectedNumberText,
            isDisabled && styles.disabledText,
            !isAvailable && styles.unavailableText,
          ]}>
            {number}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [buttonSize, selectedNumber, disabled, availableNumbers, onNumberSelect]);

  return (
    <View style={styles.backgroundContainer}>
      <View
        style={styles.container}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.numbersRow}>
          {numbers.slice(0, 5).map(renderNumberButton)}
        </View>
        <View style={styles.numbersRow}>
          {numbers.slice(5, 9).map(renderNumberButton)}
          <TouchableOpacity
            onPress={() => onNumberSelect(0)}
            disabled={disabled}
            activeOpacity={0.7}
            testID="erase-button"
          >
            <View
              style={[
                styles.numberButton,
                styles.eraseButton,
                { width: buttonSize, height: buttonSize },
                disabled && styles.disabledButton,
              ]}
            >
              <Eraser size={24} color={disabled ? Colors.textLight : Colors.error} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default NumberPad;

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: Colors.boardContainer,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: -15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  container: {
    alignItems: 'center',
    gap: 16,
  },
  numbersRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  numberButton: {
    backgroundColor: Colors.cellBackground,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.gridLineThin,
  },
  selectedNumberButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  disabledButton: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  unavailableButton: {
    backgroundColor: Colors.cellError,
    borderColor: Colors.error,
  },
  eraseButton: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  numberText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.numberNormal,
  },
  selectedNumberText: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  disabledText: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  unavailableText: {
    color: Colors.error,
    fontWeight: '600',
  },
});
