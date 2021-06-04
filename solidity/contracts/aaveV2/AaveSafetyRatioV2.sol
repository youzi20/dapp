pragma solidity ^0.6.0;

import "./AaveHelperV2.sol";
import "../interfaces/ILendingPoolV2.sol";
/**
调用aave获取用户最大借款额度和剩余额度计算安全汇率。越大越安全
*/
contract AaveSafetyRatioV2 is AaveHelperV2 {
	//越大越安全 100%就是额度用完了
    function getSafetyRatio(address _market, address _user) public view returns(uint256) {
        ILendingPoolV2 lendingPool = ILendingPoolV2(ILendingPoolAddressesProviderV2(_market).getLendingPool());
        
        (,uint256 totalDebtETH,uint256 availableBorrowsETH,,,) = lendingPool.getUserAccountData(_user);

        if (totalDebtETH == 0) return uint256(0);
        //totalDebtETH 总欠款
        //availableBorrowsETH 还可以再借款
        //（totalDebtETH+availableBorrowsETH）/totalDebtETH
        //越大越安全
        return wdiv(add(totalDebtETH, availableBorrowsETH), totalDebtETH);
    }
}