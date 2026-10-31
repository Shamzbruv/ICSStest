import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Mic2, Heart, MousePointer2 } from 'lucide-react';
import { jamaicaParishes } from './jamaicaParishes';
import './parish-map.css';

const parishNames = ['Kingston','St. Andrew','St. Catherine','Clarendon','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','St. Mary','Portland','St. Thomas'];
export default function ParishMap({ artists }) {
  const [selected, setSelected] = useState('Kingston');
  const parishArtists = artists.filter(artist => artist.parish === selected);
  const totalVotes = parishArtists.reduce((sum, artist) => sum + artist.votes, 0);
  const selectParish = name => setSelected(name);
  return <section className="page content-section parish-map-page">
    <div className="page-head"><p className="eyebrow">ONE ISLAND. FOURTEEN STORIES.</p><h1>Rep your roots.</h1><p>Find your parish on the map. Discover its voices and bring the support.</p></div>
    <div className="parish-explorer">
      <div className="island-map-panel">
        <div className="map-panel-heading"><span className="eyebrow">JAMAICA / THE PARISHES</span><span><MousePointer2 size={12}/> Select a parish</span></div>
        <div className="map-scroll" tabIndex={0} role="region" aria-label="Interactive Jamaica map. On small screens, scroll sideways or use the parish selector below.">
          <svg className="jamaica-map" viewBox="0 0 1000 510" aria-labelledby="jamaica-map-title jamaica-map-desc">
            <title id="jamaica-map-title">Jamaica’s fourteen parishes</title>
            <desc id="jamaica-map-desc">Select a labelled parish to see sample contestants and demo votes. Use Tab to move between parishes and Enter or Space to select.</desc>
            <defs><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#c4d3aa" strokeOpacity=".045" strokeWidth="1"/></pattern></defs>
            <rect width="1000" height="510" fill="url(#map-grid)"/>
            <text className="sea-label" x="90" y="445">CARIBBEAN SEA</text>
            <g className="compass" aria-hidden="true" transform="translate(920 55)"><text y="-16" textAnchor="middle">N</text><path d="M0 -7L-7 14L0 10L7 14Z"/><line x1="0" x2="0" y1="10" y2="28"/></g>
            {jamaicaParishes.map((parish, index) => {
              const active = selected === parish.name;
              const count = artists.filter(artist => artist.parish === parish.name).length;
              return <g key={parish.name} className={`parish-region ${active?'is-selected':''}`} role="button" tabIndex={0} aria-label={`${parish.name}, ${count} sample ${count===1?'artist':'artists'}`} aria-pressed={active} onClick={() => selectParish(parish.name)} onKeyDown={event => {
                if(event.key==='Enter'||event.key===' '){event.preventDefault();selectParish(parish.name);}
                if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
                  event.preventDefault();
                  const next=(index+(event.key==='ArrowRight'?1:-1)+jamaicaParishes.length)%jamaicaParishes.length;
                  const siblings=event.currentTarget.parentNode.querySelectorAll('.parish-region');siblings[next]?.focus();selectParish(jamaicaParishes[next].name);
                }
              }}>
                <title>{parish.name} — select to explore</title>
                <path className="parish-land" d={parish.path} fillRule="evenodd"/>
                {parish.leader&&<><path className="parish-leader" d={`M${parish.center.join(',')} L${parish.center[0]},${parish.label[1]-18} L${parish.label[0]},${parish.label[1]-18}`}/><circle className="parish-anchor" cx={parish.center[0]} cy={parish.center[1]} r="4"/><rect className="kingston-hit-target" x={parish.label[0]-49} y={parish.label[1]-15} width="98" height="29" rx="6"/></>}
                <text className={`parish-label ${parish.leader?'outside-label':''}`} x={parish.label[0]} y={parish.label[1]} textAnchor="middle" dominantBaseline="middle">{parish.name}</text>
              </g>;
            })}
          </svg>
        </div>
        <div className="map-legend"><span><i className="legend-default"/> Parish boundary</span><span><i className="legend-active"/> Selected parish</span><span className="map-pan-hint">Swipe map to explore ↔</span></div>
      </div>
      <aside className="parish-inspector" aria-label="Selected parish details">
        <div className="inspector-top"><MapPin size={20}/><span>YOUR PARISH. YOUR PRIDE.</span></div>
        <div aria-live="polite" aria-atomic="true"><h2>{selected}</h2><p className="parish-support-copy">{parishArtists.length?'Meet the voices repping this parish.':'The next big voice could come from here.'}</p>
          <div className="parish-demo-stats"><div><Mic2 size={15}/><strong>{parishArtists.length}</strong><small>sample {parishArtists.length===1?'artist':'artists'}</small></div><div><Heart size={15}/><strong>{totalVotes.toLocaleString()}</strong><small>demo votes</small></div></div>
        </div>
        {parishArtists.length>0?<div className="parish-artist-list">{parishArtists.map(artist=><Link key={artist.id} to={`/contestant/${artist.id}`}><span className="parish-artist-initials" style={{background:artist.color}}>{artist.name.split(' ').map(word=>word[0]).join('')}</span><span><strong>{artist.name}</strong><small>{artist.genre}</small></span><ArrowUpRight size={16}/></Link>)}</div>:<div className="parish-no-artists"><Mic2 size={22}/><p>No sample artists are listed for {selected} yet. The official lineup will appear when competition content is connected.</p></div>}
        <Link className="button gold" to={`/contestants?parish=${encodeURIComponent(selected)}`}>Explore {selected} <ArrowUpRight size={16}/></Link>
        <small className="parish-demo-note">Sample content for the client preview.</small>
      </aside>
    </div>
    <div className="parish-quick-pick"><label htmlFor="parish-picker">Jump to your parish</label><select id="parish-picker" value={selected} onChange={event=>selectParish(event.target.value)}>{parishNames.map(name=><option key={name}>{name}</option>)}</select><span>14 parishes. One stage.</span></div>
    <div className="parish-chip-list" role="group" aria-label="Choose a parish">{parishNames.map(name=><button key={name} type="button" aria-pressed={selected===name} onClick={()=>selectParish(name)}>{name}<ArrowUpRight size={12}/></button>)}</div>
    <p className="map-attribution">Map adapted from <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> · OpenStreetMap / Wambacher · <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a>. Simplified boundaries for display.</p>
  </section>;
}
