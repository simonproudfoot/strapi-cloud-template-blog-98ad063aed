import React from 'react';

const Initializer = ({ setPlugin }) => {
  const ref = React.useRef(false);
  React.useEffect(() => {
    if (!ref.current) {
      setPlugin('openai-recipe-generator');
      ref.current = true;
    }
  }, [setPlugin]);
  return null;
};

export { Initializer };
