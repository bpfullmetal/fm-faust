import * as React from 'react';

const TeamStudioItem = ({ data, animate }) => {
  const [beginRevealed, setBeginRevealed] = React.useState(false);
  const [nameRevealed, setNameRevealed] = React.useState(false);
  const [roleRevealed, setRoleRevealed] = React.useState(false);
  const [bioRevealed, setBioRevealed] = React.useState(false);
  const [readMoreDisplayed, setReadMoreDisplayed] = React.useState(false);

  React.useEffect(() => {
    if (animate) {
      setBeginRevealed(true);
      setTimeout(() => setNameRevealed(true), 500);
      setTimeout(() => setRoleRevealed(true), 750);
      setTimeout(() => setBioRevealed(true), 1000);
    }
  }, [animate]);

  return (
    <div className="w-[360px] flex flex-col mr-6 mb-24">
      <div
        className={`w-0 h-px bg-white mb-2 transition-all duration-500 ${
          beginRevealed ? '!w-full' : ''
        }`}
      ></div>
      <p
        className={`animate-reveal text-4xl leading-[44px] mb-1 ${
          nameRevealed ? 'reveal' : ''
        }`}
      >
        {data.name}
      </p>
      <p
        className={`animate-reveal text-xs tracking-[2px] uppercase mb-9 ${
          roleRevealed ? 'reveal' : ''
        }`}
      >
        {data.role}
      </p>
      {data.bio && (
        <div className={`animate-reveal ${bioRevealed ? 'reveal' : ''}`}>
          <p>{data.bio}</p>
          {data.bioMore && (
            <>
              <p
                className={`mt-1 animate-reveal-down animate-hidden ${
                  readMoreDisplayed ? 'reveal-down' : ''
                }`}
              >
                {data.bioMore}
              </p>
              <button
                className="mt-4 text-sm leading-[20px] tracking-[0.45px] underline uppercase"
                onClick={() => setReadMoreDisplayed(!readMoreDisplayed)}
              >
                {`Read ${readMoreDisplayed ? 'less' : 'more'}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamStudioItem;
