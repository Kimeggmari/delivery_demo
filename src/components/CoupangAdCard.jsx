import { useEffect, useState } from "react";

export default function CoupangAdCard({ th }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFailed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 340, margin: "0 auto 24px", boxSizing: "border-box", textAlign: "left" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "10px", border: "1px solid " + th.line, boxShadow: "0 6px 18px rgba(0,0,0,0.05)", overflow: "hidden", minHeight: 132 }}>
        <div style={{ fontSize: 11, color: th.muted, marginBottom: 8, paddingLeft: 2, fontWeight: 700 }}>추천 상품</div>
        {!loaded && !failed && (
          <div style={{ height: 94, borderRadius: 12, background: "#f8fafc", border: "1px dashed " + th.line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: th.muted }}>
            추천 상품 불러오는 중...
          </div>
        )}
        {failed && !loaded && (
          <div style={{ height: 94, borderRadius: 12, background: "#f8fafc", border: "1px dashed " + th.line, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 12, color: th.muted, lineHeight: 1.45, padding: "0 12px" }}>
            광고 차단 또는 브라우저 설정 때문에
            <br />
            추천 상품이 표시되지 않을 수 있어요
          </div>
        )}
        <iframe
          title="추천 상품"
          src="https://ads-partners.coupang.com/widgets.html?id=976548&template=carousel&trackingCode=AF7204416&width=300&height=94&tsource="
          width="300"
          height="94"
          frameBorder="0"
          scrolling="no"
          referrerPolicy="unsafe-url"
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
          style={{ display: loaded ? "block" : "none", width: "100%", maxWidth: 300, height: 94, margin: "0 auto", border: "none", borderRadius: 12, overflow: "hidden", background: "transparent" }}
        />
      </div>
      <div style={{ fontSize: 9, color: th.muted, opacity: 0.6, marginTop: 6, paddingLeft: 2, lineHeight: 1.4 }}>
        이 링크는 쿠팡파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다
      </div>
    </div>
  );
}
