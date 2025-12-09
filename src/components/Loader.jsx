import { Oval } from "react-loader-spinner";

const Loader = () => {
  return (
    <Oval
      height={40}
      width={40}
      color="blue"
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor="blue"
      strokeWidth={2}
      strokeWidthSecondary={2}
    />
  );
};

export default Loader;
