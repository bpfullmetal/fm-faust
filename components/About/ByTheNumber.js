import * as React from 'react';

const ByTheNumberBlock = ({ data }) => {
  const [byTheNumberIndex, setByTheNumberIndex] = React.useState(-1);
  const [nIntervalId, setNIntervalId] = React.useState(null);
  const [intervalCount, setIntervalCount] = React.useState(0);
  const [metrics, setMetrics] = React.useState([]);

  const byTheNumberRef = React.useRef();

  React.useEffect(() => {
    const byTheNumberEle = byTheNumberRef.current;
    if (byTheNumberEle) {
      if (!byTheNumberEle.classList.value.includes('animate')) {
        setTimeout(() => {
          byTheNumberEle.classList.add('animate');
          setByTheNumberIndex(0);
        }, 1000);
      }
    }
  }, [byTheNumberRef]);

  React.useEffect(() => {
    setMetrics(data.metrics.filter( metric => metric.metric ))
  }, [data.metrics]);

  React.useEffect(() => {
    if (
      !nIntervalId &&
      byTheNumberIndex > -1 &&
      byTheNumberIndex < metrics.length
    ) {
      if (intervalCount < 1) {
        const intervalId = setInterval(
          () => setIntervalCount((old) => old + 1),
          (metrics[byTheNumberIndex].count * 25) /
            metrics[byTheNumberIndex].count /
            10
        );
        setNIntervalId(intervalId);
      }
    }
  }, [byTheNumberIndex, metrics, intervalCount, nIntervalId]);

  React.useEffect(() => {
    if (
      nIntervalId &&
      byTheNumberIndex > -1 &&
      byTheNumberIndex < metrics.length
    ) {
      if (intervalCount >= metrics[byTheNumberIndex].count * 10) {
        clearInterval(nIntervalId);
        setTimeout(() => {
          setNIntervalId(null);
          setByTheNumberIndex((old) => old + 1);
          setIntervalCount(0);
        }, 250);
      }
    }
  }, [byTheNumberIndex, metrics, intervalCount, nIntervalId]);

  const dispCountingNumber = (count, i) => {
    if (i > byTheNumberIndex) return '';

    if (i === byTheNumberIndex) {
      const stepCount = Math.floor(count / 3);
      let countingNum = 0;

      if (intervalCount <= count * 2) {
        countingNum = Math.floor(
          intervalCount / ((count * 2) / stepCount)
        );
      } else if (intervalCount <= count * 5) {
        countingNum =
          stepCount +
          Math.floor(
            (intervalCount - count * 2) / ((count * 3) / stepCount)
          );
      } else {
        countingNum =
          stepCount * 2 +
          Math.floor(
            (intervalCount - count * 5) /
              ((count * 5) / (count - stepCount * 2))
          );
      }

      return countingNum < 1 ? '' : countingNum;
    }

    return count;
  };
  
  if ( !metrics.length ) {
    return <></>
  }
  return (
    <div className="h-[70vh]" ref={byTheNumberRef}>
      {data.heading && <p className="text-sm pt-[20vh] pb-5">{data.heading}</p>}
      {metrics.map((item, i) => (
        <p className="text-2xl leading-[30px]" key={i}>
          {dispCountingNumber(item.count, i)}{' '}
          <span className={`${i < byTheNumberIndex ? 'fade-in' : 'opacity-0'}`}>
            {item.metric}
          </span>
        </p>
      ))}
    </div>
  );
};

export default ByTheNumberBlock;
