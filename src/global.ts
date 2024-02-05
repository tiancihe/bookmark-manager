declare const __DEV__: boolean
declare const __CHROME__: boolean

declare module "redux-logger"

interface Window {
    __REDUX_STORE__: any
}
