// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSD {
    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    uint256 constant private ETH_PRICE_DECIMALS = 8;
    uint256 constant private NUSD_PRICE_DECIMALS = 4;

    AggregatorV3Interface private ethPriceFeed;

    event Deposit(address indexed user, uint256 ethAmount, uint256 nusdAmount);
    event Redeem(address indexed user, uint256 nusdAmount, uint256 ethAmount);

    constructor(address _ethPriceFeed) {
        name = "nUSD";
        symbol = "nUSD";
        decimals = 18;

        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
    }

    function deposit(uint256 ethAmount) external {
        require(ethAmount > 0, "ETH amount must be greater than zero");

        uint256 nusdAmount = ethAmount / 2;
        require(nusdAmount > 0, "nUSD amount must be greater than zero");

        require(
            balanceOf[msg.sender] + nusdAmount >= balanceOf[msg.sender],
            "Balance overflow"
        );

        require(
            totalSupply + nusdAmount >= totalSupply,
            "Total supply overflow"
        );

        (uint256 ethPrice, ) = _getEthPrice();
        uint256 expectedNusdAmount = (ethAmount * ethPrice) / (10 ** ETH_PRICE_DECIMALS * 2);
        require(
            nusdAmount >= expectedNusdAmount,
            "Received nUSD amount is less than expected"
        );

        balanceOf[msg.sender] += nusdAmount;
        totalSupply += nusdAmount;

        emit Deposit(msg.sender, ethAmount, nusdAmount);
    }

    function redeem(uint256 nusdAmount) external {
        require(nusdAmount > 0, "nUSD amount must be greater than zero");
        require(
            balanceOf[msg.sender] >= nusdAmount,
            "Insufficient nUSD balance"
        );

        require(
            totalSupply >= nusdAmount,
            "Insufficient total nUSD supply"
        );

        (uint256 ethPrice, ) = _getEthPrice();
        uint256 expectedEthAmount = (nusdAmount * 2 * (10 ** ETH_PRICE_DECIMALS)) / ethPrice;
        require(
            expectedEthAmount > 0,
            "ETH amount to redeem must be greater than zero"
        );

        require(
            balanceOf[msg.sender] - nusdAmount <= balanceOf[msg.sender],
            "Balance underflow"
        );

        require(
            totalSupply - nusdAmount <= totalSupply,
            "Total supply underflow"
        );

        balanceOf[msg.sender] -= nusdAmount;
        totalSupply -= nusdAmount;

        emit Redeem(msg.sender, nusdAmount, expectedEthAmount);
    }

    function _getEthPrice() private view returns (uint256, uint8) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        return (uint256(price), ethPriceFeed.decimals());
    }
}
