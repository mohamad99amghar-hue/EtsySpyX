
export default function OpportunityMap() {
  const opportunities = [
    { title: "Minimalist Cat Furniture", growth: "+120%", competition: "Low" },
    { title: "Personalized Stanley Cups", growth: "+450%", competition: "High" },
    { title: "Digital Planner 2024", growth: "+80%", competition: "Medium" },
    { title: "Crochet Mushroom Hat", growth: "+200%", competition: "Low" },
    { title: "Bridesmaid Proposal Box", growth: "+60%", competition: "High" },
    { title: "Custom Pet Portrait", growth: "+40%", competition: "Medium" },
  ];

  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-3xl font-bold">Opportunity Map</h1>
        <p className="text-slate-500">Trending niches detected by our AI radar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp, i) => (
            <div key={i} className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">{opp.growth}</span>
                    <span className="text-xs text-slate-400">{opp.competition} Comp</span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-orange-600 transition-colors">{opp.title}</h3>
                <p className="text-sm text-slate-500 mt-2">Predicted demand spike in next 30 days.</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                    <button className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200">View Data</button>
                    <button className="text-xs font-bold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-slate-800">Generate Listings</button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
