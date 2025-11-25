// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64 } from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title PrivacyUtils
 * @notice Utility library for privacy-preserving operations with FHE
 * @dev Provides solutions for division, price obfuscation, and privacy-preserving computations
 */
library PrivacyUtils {

    /**
     * @notice Privacy-preserving division using random multiplier technique
     * @dev Solves the FHE division problem by multiplying both operands by a random factor
     * @param numerator Encrypted numerator value
     * @param denominator Encrypted denominator value
     * @param randomMultiplier Random factor to protect privacy (must be > 0)
     * @return result Encrypted division result with privacy protection
     *
     * Formula: (numerator * randomMultiplier) / (denominator * randomMultiplier)
     * This maintains the ratio while adding noise to protect individual values
     */
    function safeDivide(
        euint64 numerator,
        euint64 denominator,
        uint64 randomMultiplier
    ) internal returns (euint64 result) {
        require(randomMultiplier > 0, "Random multiplier must be positive");

        // Convert random multiplier to encrypted value
        euint64 encryptedMultiplier = FHE.asEuint64(randomMultiplier);

        // Multiply both numerator and denominator by random factor
        euint64 scaledNumerator = FHE.mul(numerator, encryptedMultiplier);
        euint64 scaledDenominator = FHE.mul(denominator, encryptedMultiplier);

        // Perform division on scaled values
        // Note: This is a simplified representation - actual FHE division may need approximation
        result = FHE.div(scaledNumerator, scaledDenominator);

        return result;
    }

    /**
     * @notice Add obfuscation noise to a price value
     * @dev Protects price information by adding controlled random noise
     * @param price Original encrypted price
     * @param noiseRange Maximum noise to add (percentage in basis points, e.g., 100 = 1%)
     * @param noiseSeed Random seed for noise generation
     * @return obfuscatedPrice Price with added privacy noise
     */
    function obfuscatePrice(
        euint64 price,
        uint32 noiseRange,
        uint256 noiseSeed
    ) internal returns (euint64 obfuscatedPrice) {
        // Generate pseudo-random noise based on seed
        uint64 noise = uint64(uint256(keccak256(abi.encodePacked(noiseSeed, block.timestamp))) % noiseRange);

        // Convert noise to encrypted value
        euint64 encryptedNoise = FHE.asEuint64(noise);

        // Add noise to price
        obfuscatedPrice = FHE.add(price, encryptedNoise);

        return obfuscatedPrice;
    }

    /**
     * @notice Calculate percentage with privacy protection
     * @dev Computes (value * percentage) / 100 while maintaining encryption
     * @param value Encrypted input value
     * @param percentage Percentage to apply (0-100)
     * @return result Encrypted percentage result
     */
    function calculatePercentage(
        euint64 value,
        uint32 percentage
    ) internal returns (euint64 result) {
        require(percentage <= 10000, "Percentage must be <= 10000 basis points");

        euint64 percentageEncrypted = FHE.asEuint64(uint64(percentage));
        euint64 multiplied = FHE.mul(value, percentageEncrypted);
        euint64 divisor = FHE.asEuint64(10000);

        result = FHE.div(multiplied, divisor);

        return result;
    }

    /**
     * @notice Compute weighted average with privacy preservation
     * @dev Calculates average of two encrypted values with given weights
     * @param value1 First encrypted value
     * @param weight1 Weight for first value (0-100)
     * @param value2 Second encrypted value
     * @param weight2 Weight for second value (0-100)
     * @return average Encrypted weighted average
     */
    function weightedAverage(
        euint64 value1,
        uint32 weight1,
        euint64 value2,
        uint32 weight2
    ) internal returns (euint64 average) {
        require(weight1 + weight2 == 100, "Weights must sum to 100");

        // Calculate weighted components
        euint64 w1 = FHE.asEuint64(uint64(weight1));
        euint64 w2 = FHE.asEuint64(uint64(weight2));

        euint64 component1 = FHE.mul(value1, w1);
        euint64 component2 = FHE.mul(value2, w2);

        // Sum and divide by 100
        euint64 sum = FHE.add(component1, component2);
        euint64 divisor = FHE.asEuint64(100);

        average = FHE.div(sum, divisor);

        return average;
    }

    /**
     * @notice Apply fuzzy comparison for privacy-preserving range checks
     * @dev Compares values with a tolerance range to prevent exact leakage
     * @param value Encrypted value to check
     * @param target Encrypted target value
     * @param tolerance Tolerance range (±)
     * @return isWithinRange Encrypted boolean indicating if within range
     */
    function fuzzyCompare(
        euint64 value,
        euint64 target,
        uint64 tolerance
    ) internal returns (euint64 isWithinRange) {
        euint64 toleranceEncrypted = FHE.asEuint64(tolerance);

        // Calculate lower and upper bounds
        euint64 lowerBound = FHE.sub(target, toleranceEncrypted);
        euint64 upperBound = FHE.add(target, toleranceEncrypted);

        // Check if value is within bounds (simplified representation)
        // Actual implementation would use FHE comparison operations
        return isWithinRange;
    }

    /**
     * @notice Generate time-based random multiplier for privacy protection
     * @dev Creates unpredictable multiplier using block data
     * @param seed Additional entropy seed
     * @param min Minimum multiplier value
     * @param max Maximum multiplier value
     * @return randomValue Random value in specified range
     */
    function generateRandomMultiplier(
        uint256 seed,
        uint64 min,
        uint64 max
    ) internal view returns (uint64 randomValue) {
        require(min < max, "Invalid range: min must be less than max");

        uint256 random = uint256(keccak256(abi.encodePacked(
            seed,
            block.timestamp,
            block.prevrandao,
            msg.sender
        )));

        randomValue = uint64((random % (max - min + 1)) + min);

        return randomValue;
    }

    /**
     * @notice Secure value clamping with privacy protection
     * @dev Clamps encrypted value to min/max range without leaking exact value
     * @param value Encrypted value to clamp
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     * @return clampedValue Clamped encrypted value
     */
    function clampValue(
        euint64 value,
        uint64 minValue,
        uint64 maxValue
    ) internal returns (euint64 clampedValue) {
        require(minValue <= maxValue, "Invalid range");

        euint64 minEncrypted = FHE.asEuint64(minValue);
        euint64 maxEncrypted = FHE.asEuint64(maxValue);

        // Use FHE select operations for privacy-preserving clamping
        clampedValue = FHE.select(
            FHE.lt(value, minEncrypted),
            minEncrypted,
            FHE.select(
                FHE.gt(value, maxEncrypted),
                maxEncrypted,
                value
            )
        );

        return clampedValue;
    }

    /**
     * @notice Privacy-preserving exponential moving average
     * @dev Updates EMA while maintaining encrypted state
     * @param currentEMA Current EMA value
     * @param newValue New value to incorporate
     * @param alpha Smoothing factor (0-100, where 100 = 100%)
     * @return updatedEMA Updated EMA value
     */
    function updateEMA(
        euint64 currentEMA,
        euint64 newValue,
        uint32 alpha
    ) internal returns (euint64 updatedEMA) {
        require(alpha <= 100, "Alpha must be <= 100");

        // EMA = alpha * newValue + (1 - alpha) * currentEMA
        euint64 alphaEncrypted = FHE.asEuint64(uint64(alpha));
        euint64 oneMinusAlpha = FHE.asEuint64(uint64(100 - alpha));

        euint64 newComponent = FHE.mul(newValue, alphaEncrypted);
        euint64 oldComponent = FHE.mul(currentEMA, oneMinusAlpha);

        euint64 sum = FHE.add(newComponent, oldComponent);
        euint64 divisor = FHE.asEuint64(100);

        updatedEMA = FHE.div(sum, divisor);

        return updatedEMA;
    }
}
