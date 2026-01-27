export const isShowAssets = (value: string | number, isShowProfileAssets: boolean) => {
  return isShowProfileAssets ? value : '********'
}
