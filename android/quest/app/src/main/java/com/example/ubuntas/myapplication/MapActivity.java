package com.example.ubuntas.myapplication;


import android.location.Location;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.TileOverlay;
import com.google.android.gms.maps.model.TileOverlayOptions;
import com.google.android.gms.maps.model.TileProvider;
import com.google.android.gms.maps.model.UrlTileProvider;

import java.net.URL;

import static com.google.android.gms.maps.GoogleMap.MAP_TYPE_NONE;

public class MapActivity implements OnMapReadyCallback {

    private GoogleMap map = null;
    private TileOverlay osmOverlay = null;

    public void init(SupportMapFragment mapFragment) {
        mapFragment.getMapAsync(this);
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        map = googleMap;
        map.setMapType(MAP_TYPE_NONE);
        TileProvider tileProvider = new UrlTileProvider(256, 256) {
            @Override
            public URL getTileUrl(int x, int y, int zoom) {

                String s = String.format("https://tile.thunderforest.com/cycle/%d/%d/%d.png?apikey=ff9418c7fe4742a2a9cd83eeafac3fa1",
                        zoom, x, y);

                try {
                    return new URL(s);
                } catch (Exception e) {
                    throw new AssertionError(e);
                }
            }
        };

        osmOverlay = map.addTileOverlay(new TileOverlayOptions().tileProvider(tileProvider));
        // this.osmOverlay.setTransparency(0.0f);

        // Add a marker in Sydney, Australia,
        // and move the map's camera to the same location.
        LatLng sydney = new LatLng(50.101576, 36.289871);
        map.addMarker(new MarkerOptions().position(sydney)
                .title("Marker in Sydney"));
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 13));
    }

    public void onLocationChanged(Location location) {
        map.addMarker(new MarkerOptions().position(new LatLng(location.getLatitude(), location.getLongitude())));
    }
/*
    // Acquire a reference to the system Location Manager
    LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);

    // Define a listener that responds to location updates
    LocationListener locationListener = new LocationListener() {
        public void onLocationChanged(Location location) {
            // Called when a new location is found by the network location provider.
            makeUseOfNewLocation(location);
        }

        public void onStatusChanged(String provider, int status, Bundle extras) {}

        public void onProviderEnabled(String provider) {}

        public void onProviderDisabled(String provider) {}
    };

// Register the listener with the Location Manager to receive location updates
locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);*/
}
