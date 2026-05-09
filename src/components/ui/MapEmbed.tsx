"use client";

import { useState, useEffect } from "react";
import { MapPin, ExternalLink } from "lucide-react";

interface MapEmbedProps {
  lat: number;
  lng: number;
  zoom: number;
}

export function MapEmbed({ lat, lng, zoom }: MapEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Check if coordinates are placeholder values
  const isPlaceholder = lat === 0 && lng === 0;

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden shadow-md">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {isPlaceholder ? (
          <div className="w-full h-[300px] bg-muted/30 flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="w-12 h-12 mx-auto text-muted mb-3" />
              <p className="text-text-secondary text-sm">
                Map will appear here when coordinates are set
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`}
            width="100%"
            height="300px"
            className="rounded-xl"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoading(false)}
          />
        )}
        {/* Gradient overlay with hint */}
        {!isPlaceholder && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <p className="text-white text-sm text-center font-medium">
              📍 You're getting closer, Bubu!
            </p>
          </div>
        )}
      </div>

      {!isPlaceholder && (
        <a
          href={`https://maps.google.com/?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-primary hover:text-secondary transition-colors font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open in Google Maps</span>
        </a>
      )}

      {/* Note for developer */}
      {isPlaceholder && (
        <p className="text-xs text-text-secondary text-center">
          Note: Full map style customization requires Maps JavaScript API with billing-enabled key
        </p>
      )}
    </div>
  );
}
