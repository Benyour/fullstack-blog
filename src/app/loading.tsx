export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="loading-dots" aria-label="页面加载中" role="status">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}


