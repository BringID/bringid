import TRequestType from "./request-type";
import TErrorType from "./error-type";

type TRequest = {
  type: TRequestType
  error?: TErrorType
  payload?: any
}

export default TRequest