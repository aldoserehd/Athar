import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/theme';
import { Mosque } from '../types';

type Props = {
  mosques: Mosque[];
  center: { latitude: number; longitude: number };
  onSelect: (id: string) => void;
  height?: number;
};

/**
 * Interactive map via Leaflet + OpenStreetMap tiles rendered in a WebView. No
 * API key or billing needed (unlike Google Maps), and it works the same on iOS
 * and Android. Shows the user's location and a pin per nearby mosque; tapping a
 * pin selects that mosque. Requires internet (maps always do).
 */
export function MosqueMap({ mosques, center, onSelect, height = 260 }: Props) {
  const theme = useTheme();

  const html = useMemo(() => {
    const points = mosques.map((m) => ({ id: m.id, name: m.name, lat: m.latitude, lng: m.longitude }));
    const primary = theme.colors.primary;
    const dark = theme.scheme === 'dark';
    return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:${theme.colors.surfaceAlt};}
  .pin{width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${primary};border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.4);}
  .pin span{transform:rotate(45deg);display:block;text-align:center;line-height:24px;font-size:13px;}
  .leaflet-popup-content{font-family:-apple-system,Roboto,sans-serif;font-size:13px;font-weight:600;}
  ${dark ? '.leaflet-tile{filter:brightness(0.75) invert(0.02);}' : ''}
</style></head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var center=[${center.latitude},${center.longitude}];
  var mosques=${JSON.stringify(points)};
  var map=L.map('map',{zoomControl:true,attributionControl:false}).setView(center,14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  L.circleMarker(center,{radius:8,color:'#fff',weight:3,fillColor:'${primary}',fillOpacity:1}).addTo(map);
  var icon=L.divIcon({className:'',html:'<div class="pin"><span>🕌</span></div>',iconSize:[26,26],iconAnchor:[13,26],popupAnchor:[0,-24]});
  mosques.forEach(function(m){
    var mk=L.marker([m.lat,m.lng],{icon:icon}).addTo(map).bindPopup(m.name);
    mk.on('click',function(){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(m.id); });
  });
  if(mosques.length){ try{ var g=L.featureGroup(mosques.map(function(m){return L.marker([m.lat,m.lng]);})); map.fitBounds(g.getBounds().pad(0.3),{maxZoom:15}); }catch(e){} }
</script></body></html>`;
  }, [mosques, center.latitude, center.longitude, theme]);

  return (
    <View style={[styles.wrap, { height, borderColor: theme.colors.border }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: theme.colors.surfaceAlt }}
        onMessage={(e) => onSelect(e.nativeEvent.data)}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
