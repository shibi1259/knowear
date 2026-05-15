"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AddressCard from "../address-card/AddressCard";
import Cookies from "js-cookie";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import debounce from "lodash/debounce";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import AddressConfirmationModal from "@/components/orders/ConfirmCheckout";
import { usePathname, useRouter } from "next/navigation";
import { StateContext } from "@/providers/state/StateContext";
// import { trackPurchased } from "@/config/fpixel"; // removed: duplicate purchase tracking

// Zod schema for form validation
const baseSchema = z.object({
  type: z.enum(["Home", "Work"]),
  firstname: z.string().min(1, "Name is required"),
  countryName: z.string().optional(),
  // areanumber: z.string().min(1, "Area name is required"),
  lastname: z.string().optional(),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  country: z.string().min(1, "Country is required"),
  // streetAddress:z.string().optional(),
  additionalAddress: z.string().min(1, "Additional address is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  aptSuiteUnit: z.string().optional(),
  // city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  mobile: z.string().min(1, "Phone is required"),
  deliveryInstruction: z.string().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
  isChecked: z.boolean().optional(),
  countryCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  postalCode: z.string().optional(),
  fullAddress: z.string().optional(),
  companyName: z.string().optional(),
  customer: z.string().optional(),
});

const guestToken = Cookies.get("guest_access_token");
const addressSchema = guestToken
  ? baseSchema.extend({
      mobile: z.string().min(1, "Phone number is required"),
    })
  : baseSchema;

type AddressFormValues = z.infer<typeof addressSchema>;

type CountryOption = { label: string; value: string; code: string };

// `world-countries` is ~250 KB JSON. Defer it so the rest of checkout becomes
// interactive immediately. The list hydrates in the background and is ready
// before the user opens the country picker.
let countryOptionsCache: CountryOption[] | null = null;
let countryOptionsPromise: Promise<CountryOption[]> | null = null;

const loadCountryOptions = (): Promise<CountryOption[]> => {
  if (countryOptionsCache) return Promise.resolve(countryOptionsCache);
  if (!countryOptionsPromise) {
    countryOptionsPromise = import("world-countries").then((mod) => {
      const list = (mod.default as any[])
        .map((country: any) => ({
          label: country.name.common,
          value: country.cca2,
          code: country.idd.root + (country.idd.suffixes?.[0] || ""),
        }))
        .sort((a: CountryOption, b: CountryOption) =>
          a.label.localeCompare(b.label)
        );
      countryOptionsCache = list;
      return list;
    });
  }
  return countryOptionsPromise;
};

const emirateStates = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm al-Quwain",
  "Al Ain",
];

interface AddressFormProps {
  user?: any;
  address?: any;
  guestDetails?: {
    firstname?: string;
    lastname?: string;
    areanumber?: string;
    mobile?: string;
    email?: string;
  };
  getCartDetails: (state?: string, country?: string) => void;
  getAddress?: any;
  setCheckoutFormData?: React.Dispatch<React.SetStateAction<any>>;
  email?: string;
  checkoutFormData?: any;
}

export interface AddressFormHandle {
  submitForm: () => Promise<void>;
  // handleConfirmedSubmit: (data: any) => void;
}

const AddressForm = forwardRef<AddressFormHandle, AddressFormProps>(
  (
    {
      // user,
      // address,
      guestDetails,
      getCartDetails,
      // getAddress,
      setCheckoutFormData,
      email,
      checkoutFormData,
    },
    ref
  ) => {
    const router = useRouter();
    const { user, getUser, address, getAddress } = useContext(StateContext);
    const defaultAddress = address?.find(
      (item: any) => item?.isDefaultShipping
    );
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState<any | null>(null);
    const [currentMarker, setCurrentMarker] = useState<any | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>(
      () => countryOptionsCache ?? []
    );
    const infoWindowRef = useRef<any>();
    const isFirstWatchCall = useRef(true); // ✅ Top-level ref

    const [addressToConfirm, setAddressToConfirm] =
      useState<AddressFormValues | null>(null);

    useEffect(() => {
      if (countryOptionsCache) return;
      let cancelled = false;
      loadCountryOptions().then((list) => {
        if (!cancelled) setCountryOptions(list);
      });
      return () => {
        cancelled = true;
      };
    }, []);

    const form = useForm<AddressFormValues>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        type: "Home",
        firstname: "",
        lastname: "",
        email: user?.email || guestDetails?.email || email || "",
        companyName: "",
        // streetAddress: "",
        additionalAddress: "",
        deliveryAddress: "",
        countryName: " ",

        aptSuiteUnit: "",
        // city: "",
        state: "",
        mobile: user?.mobile || "",
        postalCode: "",
        deliveryInstruction: "",
        isDefaultShipping: false,
        isDefaultBilling: false,
        isChecked: true,
        country: "AE",
        countryCode: "+971",
        latitude: 25.2048,
        longitude: 55.2708,
      },
    });

    useEffect(() => {
      if (!form || !mapInstance || !currentMarker || !window.google) return;
      infoWindowRef.current = new window.google.maps.InfoWindow();

      const subscription = form.watch((value, { name }) => {
        if (name === "fullAddress") {
          const fullAddr = value?.fullAddress || "Location";
          infoWindowRef.current.setContent(
            `<div style="padding: 8px;">${fullAddr}</div>`
          );
          infoWindowRef.current.open(mapInstance, currentMarker);
          if (isFirstWatchCall.current) {
            isFirstWatchCall.current = false; // Skip the first call
          } else {
            setSearchQuery(value?.fullAddress || "");
          }
        }
      });

      return () => subscription.unsubscribe();
    }, [form, mapInstance, currentMarker]);

    const prepareConfirmation = (data: AddressFormValues) => {
      console.log("Preparing confirmation with:", data);
      setAddressToConfirm(data);
      handleConfirmedSubmit(data);
      // setIsConfirmationOpen(true);
    };
    const updateAddressFromPlace = useCallback(
      (place: any) => {
        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const fullAddress = place.formatted_address || "";

        // Initialize address components
        let additionalAddress = "";
        let deliveryAddress = "";
        let countryName = "";
        let city = "";
        let state = "";
        let country = "AE";
        let postalCode = "";
        let areanumber = "";
        let aptSuiteUnit = "";

        // Extract building/premise name if available
        if (
          place?.name &&
          typeof place?.name === "string" &&
          !fullAddress.toLowerCase().includes(place?.name.toLowerCase())
        ) {
          aptSuiteUnit = place?.name;
        }
        // Check if the formatted address starts with what appears to be a building name
        else {
          const formattedAddressParts = fullAddress.split(", ");
          if (formattedAddressParts?.length > 0) {
            const firstPart = formattedAddressParts[0];

            // Check if first part is likely a street address
            const roadPatterns = /\b(road|rd|street|st|avenue|ave|lane|ln)\b/i;
            if (firstPart.match(roadPatterns)) {
              // Extract any building name before the road
              const beforeRoad = firstPart.split(roadPatterns)[0];
              if (beforeRoad && beforeRoad.trim()) {
                aptSuiteUnit = beforeRoad.trim();
              }
            } else if (!/^\d+$/.test(firstPart)) {
              // Skip if it's just numbers
              aptSuiteUnit = firstPart;
            }
          }
        }

        // Process address components for delivery address
        if (place.address_components) {
          const addressParts: string[] = [];
          let hasAdminLevel1 = false;

          place.address_components.forEach((component: any) => {
            const types = component.types;
            const value = component.long_name;
            if (types.includes("premise")) {
              addressParts.push(value);
            } else if (types.includes("street_number")) {
              addressParts.push(value);
            } else if (types.includes("route")) {
              addressParts.push(value);
            } else if (types.includes("sublocality_level_1")) {
              addressParts.push(value);
            } else if (types.includes("sublocality_level_2")) {
              addressParts.push(value);
            } else if (types.includes("locality")) {
              city = value;
              addressParts.push(value);
            } else if (types.includes("neighborhood")) {
              addressParts.push(value);
            } else if (types.includes("administrative_area_level_3")) {
              addressParts.push(value);
            } else if (types.includes("administrative_area_level_2")) {
              addressParts.push(value);
            } else if (types.includes("administrative_area_level_1")) {
              state = value;
              hasAdminLevel1 = true;
              form.setValue("state", value);
            } else if (types.includes("country")) {
              country = component.short_name;
              // addressParts.push(component.long_name);
            }
          });

          // Fallback for missing administrative_area_level_1
          if (!hasAdminLevel1 && place.formatted_address) {
            const formattedParts = place.formatted_address.split(", ");
            if (formattedParts.length >= 2) {
              state = formattedParts[formattedParts.length - 2];
              addressParts.push(state);
            }
          }

          // Build delivery address
          deliveryAddress = addressParts.join(", ");

          // Clean up address (remove apt/suite if duplicated)
          if (aptSuiteUnit && deliveryAddress.startsWith(aptSuiteUnit)) {
            deliveryAddress = deliveryAddress
              .substring(aptSuiteUnit.length)
              .trim();
            if (deliveryAddress.startsWith(",")) {
              deliveryAddress = deliveryAddress.substring(1).trim();
            }
          }

          // Ensure city is included
          if (city && !deliveryAddress.includes(city)) {
            deliveryAddress += deliveryAddress ? `, ${city}` : city;
          }
        }

        // Update form values
        const selectedCountry = countryOptions.find((c) => c.value === country);
        if (selectedCountry) {
          form.setValue("countryCode", selectedCountry.code);
          form.trigger("countryCode");
          form.setValue("countryName", selectedCountry.label);
          form.trigger("countryName");
        }
        form.setValue("state", state);
        form.setValue("country", country);
        form.setValue("postalCode", postalCode);
        form.setValue("fullAddress", fullAddress);
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
        // form.setValue("areanumber", areanumber);
        form.setValue("deliveryAddress", deliveryAddress);

        form.setValue("aptSuiteUnit", aptSuiteUnit);

        // Trigger validation
        // form.trigger("city");
        form.trigger("state");
        form.trigger("country");
        form.trigger("postalCode");
        form.trigger("fullAddress");
        form.trigger("latitude");
        form.trigger("longitude");
        // form.trigger("areanumber");
        form.trigger("aptSuiteUnit");

        // Update search input if exists
        if (searchInputRef.current) {
          searchInputRef.current.value = fullAddress;
          // setSearchQuery(fullAddress);
        }

        // Update map view
        if (mapInstance) {
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(17);
        }

        if (currentMarker) {
          currentMarker.setPosition({ lat, lng });
        }
      },
      [form, mapInstance, currentMarker]
    );

    useEffect(() => {
      if (mapInstance && form.watch("latitude") && form.watch("longitude")) {
        const lat = form.watch("latitude");
        const lng = form.watch("longitude");

        // Only recenter if coordinates have actually changed
        const currentCenter = mapInstance.setCenter();
        if (
          !currentCenter ||
          currentCenter.lat() !== lat ||
          currentCenter.lng() !== lng
        ) {
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(17);

          // Update marker position if it exists
          if (currentMarker) {
            currentMarker.setPosition({ lat, lng });
          }
        }
      }
    }, [
      form.watch("latitude"),
      form.watch("longitude"),
      mapInstance,
      currentMarker,
    ]);

    // const initializeMap = useCallback(() => {
    //   if (mapRef.current && window.google) {
    //     const defaultLocation = {
    //       lat: form.getValues("latitude") || 25.2048,
    //       lng: form.getValues("longitude") || 55.2708,
    //     };

    //     const map = new window.google.maps.Map(mapRef.current, {
    //       center: defaultLocation,
    //       zoom: 15,
    //       streetViewControl: false,
    //       mapTypeControl: false,
    //     });

    //     const infoWindow = new window.google.maps.InfoWindow();
    //     const marker = new window.google.maps.Marker({
    //       position: defaultLocation,
    //       title: "Drag me to set location",
    //       map: map,
    //       draggable: true,
    //       animation: window.google.maps.Animation.DROP,
    //     });

    //     // Immediately set the form values to ensure consistency
    //     form.setValue("latitude", defaultLocation.lat);
    //     form.setValue("longitude", defaultLocation.lng);

    //     // Format address display
    //     // const formatAddress = (address: any) => {
    //     //   if (!address?.formatted_address) return "Address not available";

    //     //   return address.formatted_address
    //     //     .replace(/,?\s*\+.*$/, '')       // Remove plus codes
    //     //     .replace(/, United Arab Emirates$/, '')
    //     //     .replace(/, UAE$/, '')
    //     //     .trim();
    //     // };

    //     const updateAddress = (address: any) => {
    //       // const cleanAddress = formatAddress(address);
    //       // form.setValue("address", cleanAddress); // Update form address field
    //       // infoWindow.setContent(`<div style="padding: 8px;">${cleanAddress}</div>`);
    //       // infoWindow.open(map, marker);
    //     };

    //     const geocoder = new window.google.maps.Geocoder();

    //     // Function to handle geocoding
    //     const handleGeocode = (location: { lat: number; lng: number }) => {
    //       // infoWindow.setContent('<div style="padding: 8px;">Loading address...</div>');
    //       // infoWindow.open(map, marker);

    //       geocoder.geocode(
    //         {
    //           location,
    //           region: "AE" // Bias results to UAE
    //         },
    //         (results: any, status: any) => {
    //           if (status === "OK" && results?.[0]) {
    //             updateAddress(results[0]);
    //             updateAddressFromPlace(results[0]);
    //           } else {
    //             infoWindow.setContent('<div style="padding: 8px;">Address not available</div>');
    //             toast({
    //               title: "Address not found",
    //               description: "Please try another location or enter manually",
    //               variant: "destructive",
    //             });
    //           }
    //         }
    //       );
    //     };

    //     // Initial geocode
    //     handleGeocode(defaultLocation);

    //     // Only keep the dragend listener for position updates
    //     marker.addListener("dragend", () => {
    //       const position = marker.getPosition();
    //       if (!position) return;
    //       const lat = position.lat();
    //       const lng = position.lng();
    //       form.setValue("latitude", lat);
    //       form.setValue("longitude", lng);
    //       handleGeocode({ lat, lng });
    //     });

    //     setMapInstance(map);
    //     setCurrentMarker(marker);
    //     setMapLoaded(true);
    //   }
    // }, [form, updateAddressFromPlace]);
    // Load Google Maps script
    // const initializeMap = useCallback(() => {
    //   if (mapRef.current && window.google) {
    //     const defaultLocation = {
    //       lat: form.getValues("latitude") || 25.2048,
    //       lng: form.getValues("longitude") || 55.2708,
    //     };

    //     const map = new window.google.maps.Map(mapRef.current, {
    //       center: defaultLocation,
    //       zoom: 15,
    //       streetViewControl: false,
    //       mapTypeControl: false,
    //     });

    //     const infoWindow = new window.google.maps.InfoWindow();
    //     const marker = new window.google.maps.Marker({
    //       position: defaultLocation,
    //       title: "Drag me to set location",
    //       map: map,
    //       draggable: true,
    //       animation: window.google.maps.Animation.DROP,
    //     });

    //     // Set initial form values
    //     form.setValue("latitude", defaultLocation.lat);
    //     form.setValue("longitude", defaultLocation.lng);

    //     const geocoder = new window.google.maps.Geocoder();

    //     // Function to handle geocoding
    //     const handleGeocode = (location: { lat: number; lng: number }) => {
    //       // infoWindow.setContent('<div style="padding: 8px;">Loading address...</div>');
    //       // infoWindow.open(map, marker);

    //       geocoder.geocode(
    //         {
    //           location,
    //           region: "AE" // Bias results to UAE
    //         },
    //         (results: any, status: any) => {
    //           if (status === "OK" && results?.[0]) {
    //             updateAddressFromPlace(results[0]);
    //           } else {
    //             infoWindow.setContent('<div style="padding: 8px;">Address not available</div>');
    //             toast({
    //               title: "Address not found",
    //               description: "Please try another location or enter manually",
    //               variant: "destructive",
    //             });
    //           }
    //         }
    //       );
    //     };

    //     // Initial geocode
    //     handleGeocode(defaultLocation);

    //     // Dragend listener for marker
    //     marker.addListener("dragend", () => {
    //       const position = marker.getPosition();
    //       if (!position) return;
    //       const lat = position.lat();
    //       const lng = position.lng();
    //       form.setValue("latitude", lat);
    //       form.setValue("longitude", lng);
    //       handleGeocode({ lat, lng });
    //     });

    //     // Click listener for the map
    //     map.addListener("click", (mapsMouseEvent: any) => {
    //       // Update marker position
    //       marker.setPosition(mapsMouseEvent.latLng);

    //       // Get clicked coordinates
    //       const lat = mapsMouseEvent.latLng.lat();
    //       const lng = mapsMouseEvent.latLng.lng();

    //       // Update form values
    //       form.setValue("latitude", lat);
    //       form.setValue("longitude", lng);

    //       // Geocode the clicked location
    //       handleGeocode({ lat, lng });
    //     });

    //     setMapInstance(map);
    //     setCurrentMarker(marker);
    //     setMapLoaded(true);
    //   }
    // }, [form, updateAddressFromPlace]);
    const initializeMap = useCallback(() => {
      if (mapRef.current && window.google) {
        const defaultLocation = {
          lat: form.getValues("latitude") || 25.2048,
          lng: form.getValues("longitude") || 55.2708,
        };

        const map = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 18, // Increased zoom level for more precision
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: "greedy", // Better control on desktop and mobile
          clickableIcons: false, // Prevent clicking on POIs
          disableDoubleClickZoom: true, // More precise clicking
          draggableCursor: "pointer",
          draggingCursor: "grabbing",
        });

        const infoWindow = new window.google.maps.InfoWindow();
        const marker = new window.google.maps.Marker({
          position: defaultLocation,
          title: "Drag me to set location",
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          crossOnDrag: false, // Cleaner dragging
        });

        // Set initial form values with higher precision
        form.setValue("latitude", parseFloat(defaultLocation.lat.toFixed(8)));
        form.setValue("longitude", parseFloat(defaultLocation.lng.toFixed(8)));

        const geocoder = new window.google.maps.Geocoder();

        // Improved geocoding function with better error handling
        const handleGeocode = (location: { lat: number; lng: number }) => {
          geocoder.geocode(
            {
              location,
              region: "AE", // Bias results to UAE
              bounds: map.getBounds(), // Use current map bounds for better accuracy
            },
            (
              results: google.maps.GeocoderResult[] | null,
              status: google.maps.GeocoderStatus
            ) => {
              if (status === "OK" && results?.[0]) {
                updateAddressFromPlace(results[0]);

                // Update marker position with the precise geocoded location if needed
                const preciseLocation = results[0].geometry.location;
                marker.setPosition(preciseLocation);
                form.setValue(
                  "latitude",
                  parseFloat(preciseLocation.lat().toFixed(8))
                );
                form.setValue(
                  "longitude",
                  parseFloat(preciseLocation.lng().toFixed(8))
                );

                // Center map on the precise location
                map.setCenter(preciseLocation);
              } else {
                infoWindow.setContent(
                  '<div style="padding: 8px;">Address not available</div>'
                );
                toast({
                  title: "Address not found",
                  description: "Please try another location or enter manually",
                  variant: "destructive",
                });
              }
            }
          );
        };

        // Initial geocode with precise location
        handleGeocode(defaultLocation);

        // Improved dragend listener with precise positioning
        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (!position) return;

          // Get precise coordinates
          const lat = parseFloat(position.lat().toFixed(8));
          const lng = parseFloat(position.lng().toFixed(8));

          form.setValue("latitude", lat);
          form.setValue("longitude", lng);

          // Update map center precisely
          map.setCenter({ lat, lng });

          handleGeocode({ lat, lng });
        });

        // Improved click listener with precise coordinates
        map.addListener(
          "click",
          (mapsMouseEvent: google.maps.MapMouseEvent) => {
            if (!mapsMouseEvent.latLng) return;

            // Get precise clicked coordinates
            const lat = parseFloat(mapsMouseEvent.latLng.lat().toFixed(8));
            const lng = parseFloat(mapsMouseEvent.latLng.lng().toFixed(8));
            const preciseLocation = new google.maps.LatLng(lat, lng);

            // Update marker position precisely
            marker.setPosition(preciseLocation);

            // Update form values
            form.setValue("latitude", lat);
            form.setValue("longitude", lng);

            // Center map on the precise location
            map.setCenter(preciseLocation);

            // Geocode the clicked location
            handleGeocode({ lat, lng });
          }
        );

        setMapInstance(map);
        setCurrentMarker(marker);
        setMapLoaded(true);
      }
    }, [form, updateAddressFromPlace]);
    useEffect(() => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (!mapLoaded) {
        initializeMap();
      }

      return () => {
        if (mapInstance) {
          // Clean up map instance
          /* @ts-ignore */
          window.google.maps.event.clearInstanceListeners(mapInstance);
        }
      };
    }, [initializeMap, mapLoaded, mapInstance]);
    console.log("query", searchQuery);
    // Handle search result selection
    const handleSearchResultSelect = (prediction: any) => {
      api
        .get(`${endpoints.getLocationDetails}/${prediction.placeId}`)
        .then((response: any) => {
          if (response.data?.errorCode === 0 && response.data?.result) {
            const place = response.data.result;
            const location = {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            };
            if (mapInstance) {
              mapInstance.setCenter(location);
              mapInstance.setZoom(17);
            }

            updateAddressFromPlace({
              ...place,
              geometry: {
                location: {
                  lat: () => location.lat,
                  lng: () => location.lng,
                },
              },
            });

            setShowSearchResults(false);
          } else {
            toast({
              title: "Unable to fetch place details",
              variant: "destructive",
            });
          }
        })
        .catch((error: any) => {
          console.error("Error fetching place details:", error);
          toast({
            title: "Error fetching place details",
            variant: "destructive",
          });
        });
    };

    // Get current location
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            if (mapInstance) {
              mapInstance.setCenter({ lat: latitude, lng: longitude });
              mapInstance.setZoom(17);

              if (currentMarker) {
                currentMarker.setPosition({ lat: latitude, lng: longitude });
              } else {
                const newMarker = new window.google.maps.Marker({
                  map: mapInstance,
                  position: { lat: latitude, lng: longitude },
                  draggable: true,
                });
                setCurrentMarker(newMarker);
              }

              // Reverse geocode
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results: any, status: any) => {
                  if (status === "OK" && results?.[0]) {
                    updateAddressFromPlace(results[0]);
                  }
                }
              );
            }
          },
          (error) => {
            toast({
              title: "Error getting current location",
              description: "Please enable location services or select manually",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "Geolocation not supported",
          description: "Your browser doesn't support geolocation",
          variant: "destructive",
        });
      }
    };

    // Set initial values
    useEffect(() => {
      if (Array.isArray(address) && address.length > 0) {
        // Case when address is available (first useEffect)
        const defaultShipping = address.find(
          (addr) =>
            addr && typeof addr === "object" && addr.isDefaultShipping === true
        );

        if (defaultShipping) {
          console.log(
            "Default shipping address in useEffect:",
            defaultShipping.country
          );
          form.setValue("country", defaultShipping.country);
          form.setValue("state", defaultShipping.state);
          getCartDetails(defaultShipping.state, defaultShipping.country);
        }
      } else {
        // Case when address is NOT available (second useEffect)
        const selectedCountry = countryOptions.find(
          (c) => c.value === form.getValues("country")
        );

        if (selectedCountry) {
          form.setValue("countryCode", selectedCountry.code);
          form.trigger("countryCode");
          form.setValue("countryName", selectedCountry.label);
          form.trigger("countryName");

          const state = form.getValues("state");
          // If needed, call getCartDetails here
          getCartDetails(state, selectedCountry.value);
        }
      }
    }, [address, user, form, form.watch("country"), form.watch("state")]);

    // Debounce search
    const debouncedSearch = useCallback(
      debounce((query: string) => {
        if (query.length < 3) {
          setSearchResults([]);
          setShowSearchResults(false);
          return;
        }
        fetchAddressLocations(query);
      }, 300),
      []
    );

    // Fetch address locations
    const fetchAddressLocations = async (query: string) => {
      try {
        const response = await api.get(
          `${endpoints.getAddressLocations}?place=${encodeURIComponent(query)}`
        );

        if (
          response.data?.errorCode === 0 &&
          response.data?.result?.predictions
        ) {
          const formattedResults = response.data.result.predictions.map(
            (prediction: any) => ({
              placeId: prediction.placeId,
              description: prediction.description,
            })
          );

          setSearchResults(formattedResults);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        console.error("Error fetching address locations:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: () =>
        new Promise<void>((resolve, reject) => {
          form.handleSubmit(async (data) => {
            try {
              await handleConfirmedSubmit(data);
              resolve();
            } catch (error) {
              reject(error);
            }
          })();
        }),
      handleConfirmedSubmit,
    }));

    const handleConfirmedSubmit = async (data: AddressFormValues) => {
      if (!data) return;

      console.log(
        "---------------paymentType------------------",
        checkoutFormData?.paymentType
      );
      console.log(
        "--------------isVerified-------------------",
        checkoutFormData?.isVerified
      );
      console.log(
        "--------------isVerified && COD-------------------",
        checkoutFormData?.paymentType === "cod" && !checkoutFormData?.isVerified
      );

      

      setIsConfirmationOpen(false);

      const cartResponse: any = await getCartDetails();
      try {
        const res = await api.post(endpoints.continueasGuest, {
          // token: guestToken || "4883-5706-9900",
          firstname: data.firstname,
          lastname: data.lastname,
          mobile: data.mobile,
          email: data.email,
          countryCode: data.countryCode,
          countryName: data.countryName,
          deliveryAddress: data.deliveryAddress,
          additionalAddress: data.additionalAddress,
          address: {
            street: data.deliveryAddress,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            fullAddress: data.fullAddress,
            latitude: data.latitude,
            longitude: data.longitude,
          },
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        });

        Cookies.set("guest_access_token", res?.data?.result?.output?.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        if (checkoutFormData?.paymentType === "card") {
          if (!user?.email) {
            const body = {
              cart: cartResponse?.cart,
              guestAddress: {
                ...data,
                coordinates: {
                  latitude: data?.latitude,
                  longitude: data?.longitude,
                },
              },
              paymentMethod: "network-international",
              guest: res?.data?.result?.output?.token || "4883-5706-9900",
              deliverynote: cartResponse?.summary?.deliveryNote,
            };
            toast({
              description: "Address added successfully",
              variant: "success",
              duration: 3000,
            });

            api
              .post(endpoints.placeOrder, body)
              .then((response: any) => {
                if (response.data?.errorCode == 0) {
                  router.push(response?.data?.result?.paymentLink);
                  // trackPurchased(cartResponse); // removed: duplicate purchase tracking, now handled in order-placed page
                }
              })
              .catch((error: any) => {
                toast({
                  title: error?.message || "Something went wrong",
                  variant: "destructive",
                  duration: 3000,
                });
              });
          } else {
            const response = await api.post(endpoints.addAddress, {
              firstname: data?.firstname,
              lastname: data?.lastname,
              mobile: data?.mobile,
              type: data?.type,
              companyName: data?.companyName,
              aptSuiteUnit: data?.aptSuiteUnit,
              countryCode: data?.countryCode,
              deliveryAddress: data?.deliveryAddress,
              countryName: data?.countryName,
              additionalAddress: data?.additionalAddress,
              postalCode: data?.postalCode,
              state: data?.state,
              country: data?.country,
              email: data?.email,
              coordinates: {
                latitude: data?.latitude,
                longitude: data?.longitude,
              },
              deliveryInstruction: data?.deliveryInstruction,
              customer: data?.customer,
              isDefaultShipping: data?.isDefaultShipping || false,
              isDefaultBilling: data?.isDefaultBilling || false,
            });

            console.log("response.data", response.data);

            if (response.data?.errorCode === 0) {
              if (getAddress) getAddress();
              form.reset();
              toast({
                description: "Address added successfully",
                variant: "success",
                duration: 3000,
              });
              console.log(
                "----------TEST AS A LOGIN USER----------",
                cartResponse
              );

              // if (onPlaceOrder) {
              //   onPlaceOrder({
              //     ...data,
              //     // cartResponse,
              //     guestAddress: data,
              //     email: data?.email,
              //   });
              // }

              api
                .post(endpoints.placeOrder, {
                  cart: cartResponse?.cart,
                  address: defaultAddress?._id,
                  paymentMethod: "network-international",
                  deliverynote: cartResponse?.summary?.deliveryNote,
                })
                .then((response: any) => {
                  if (response.data?.errorCode == 0) {
                    router.push(response?.data?.result?.paymentLink);
                    toast({ description: "Placing Order.." });
                    window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
                      1
                    )}`;
                    // trackPurchased(cartResponse); // removed: duplicate purchase tracking, now handled in order-placed page
                    toast({
                      description: "Order placed Successfully",
                      variant: "success",
                    });
                  }
                })
                .catch((error: any) => {
                  toast({
                    title: "Something went wrong",
                    variant: "destructive",
                    duration: 3000,
                  });
                });
            } else {
              toast({
                description: response.data.message || "Something went wrong",
                variant: "destructive",
                duration: 3000,
              });
            }
          }
        } else {
          if (defaultAddress?._id && !guestToken) {
            console.log("defaultAddress", defaultAddress);
            api
              .post(endpoints.placeOrder, {
                cart: cartResponse?.cart,
                address: defaultAddress?._id,
                paymentMethod: "COD",
                deliverynote: cartResponse?.summary?.deliveryNote,
                guest: guestToken || "4883-5706-9900",
              })
              .then((response: any) => {
                if (response.data?.errorCode == 0) {
                  toast({ description: "Placing Order.." });
                  window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
                    1
                  )}`;
                  toast({
                    description: "Order placed Successfully",
                    variant: "success",
                  });
                }
              })
              .catch((error: any) => {
                toast({
                  title: "Something went wrong",
                  variant: "destructive",
                  duration: 3000,
                });
              });
          } else {
            console.log(
              "-------------------------------------",
              res?.data?.result?.output?.token
            );

            api
              .post(endpoints.placeOrder, {
                cart: cartResponse?.cart,
                guestAddress: {
                  ...data,
                  coordinates: {
                    latitude: data?.latitude,
                    longitude: data?.longitude,
                  },
                },
                paymentMethod: "COD",
                guest: guestToken || "4883-5706-9900",
              })
              .then((response: any) => {
                if (response.data?.errorCode == 0) {
                  toast({ description: "Placing Order.." });
                  window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
                    1
                  )}`;
                  toast({
                    description: "Order placed Successfully",
                    variant: "success",
                  });
                }
              })
              .catch((error: any) => {
                toast({
                  title: "Something went wrong",
                  variant: "destructive",
                  duration: 3000,
                });
              });
          }
        }
      } catch (error) {
        toast({
          description: "Failed to add address",
          variant: "destructive",
        });
      } finally {
        setAddressToConfirm(null);
      }
    };

    return (
      <div>
        <h4 className="font-medium text-xl md:font-semibold md:text-[22px]">
          Shipping Address
        </h4>
        {user && address?.length > 0 ? (
          <div className="grid grid-cols-2 gap-[15px] lg:gap-x-[18px] lg:gap-y-[21px] mt-3 md:mt-5 mb-3">
            {address?.map((address: any, index: number) => {
              const addressFormat =
                `${address?.deliveryAddress},` +
                " " +
                `${
                  address?.additionalAddress
                    ? `${address?.additionalAddress},`
                    : ""
                }` +
                " ";
              " " + address?.state;
              return (
                <div className="col-span-2 md:col-span-1" key={index}>
                  <AddressCard
                    type={address?.type}
                    name={address?.firstname}
                    phone={`${address?.countryCode} ${
                      address?.mobile || user?.mobile || ""
                    }`}
                    address={addressFormat}
                    isDefault={address?.isDefaultShipping}
                    id={address?.refid}
                    getAddress={getAddress}
                    email={address?.email || user?.email || ""}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleConfirmedSubmit)}>
              <div className="mt-0 md:mt-2.5 mb-5 md:mb-7 text-xs md:text-base font-normal">
                Select your shipping address by pinpointing it on the map or
                entering it manually
              </div>
              {/* <button type="submit">Submit</button>  */}

              {/* Map Container */}
              {/* <div className="relative rounded-md p-4"> */}
              {/* <h3 className="text-lg font-medium mb-3">Find Your Location</h3> */}

              {/* </div> */}
              {/* <div className="pb-[27px] sm:pb-[30px] md:pb-[47px]">
             
            </div> */}

              <div className="mb-4">
                <div className="mb-4">
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={getCurrentLocation}
                      className="flex items-center justify-center w-full bg-black text-white py-2  h-[50px] transition-colors"
                      type="button"
                    >
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="font-medium text-[18px] leading-[20px]">
                        Use my current location
                      </span>
                    </button>
                  </div>
                </div>
                <div
                  ref={mapRef}
                  className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-md mb-4"
                />{" "}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      debouncedSearch(query);
                    }}
                    placeholder="Search for your location"
                    className="w-full border border-gray-300 rounded-md py-2 px-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3  w-[18px] h-[18px] top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-1/2 max-md:w-[90%] bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                    {searchResults.map((prediction) => (
                      <div
                        key={prediction.placeId}
                        onClick={() => handleSearchResultSelect(prediction)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {prediction.description}
                      </div>
                    ))}
                  </div>
                )}
                {/* <span className="font-jost font-normal text-[18px]  p-[20px] leading-[20px] tracking-[0%] flex justify-center">
                Or
              </span> */}
              </div>
              {/* <div className="h-[1px] bg-[#D8D8D8] my-5 md:my-10"></div> */}
              <div className="grid grid-cols-2 gap-x-7 gap-y-5">
                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          Delivery Address*
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                            placeholder="Building Name, Street Number, Area Name, City Name ,Emirate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 hidden">
                  <FormField
                    control={form.control}
                    name="countryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="hidden" className="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="additionalAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          Additional Address*
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                            placeholder="Apartment, suite, building, house number, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-normal">
                          Country / Region*
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                        >
                          <FormControl className="flex h-10 w-full placeholder:text-[13px] md:placeholder:text-[14px] text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countryOptions.map((country) => (
                              <SelectItem
                                key={country.value}
                                value={country.value}
                              >
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  {" "}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          City*
                        </FormLabel>
                        {form.getValues("countryCode") === "+971" ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl className="flex h-10 w-full placeholder:text-[13px] md:placeholder:text-[14px] text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]">
                              <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {emirateStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input
                              className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                              placeholder="State"
                              {...field}
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          Email*
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                            placeholder="Email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          Phone Number*
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED] pl-[50px]"
                            placeholder="Phone"
                            left={`${form.getValues("countryCode")} |`}
                            checkout
                            {...field}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              form.setValue("mobile", numericValue);
                              form.trigger("mobile");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">
                          Full Name*
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                            placeholder="Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  {/* <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Last Name*
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          placeholder="Last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                </div>
              </div>
              {/* <div className="pb-[27px] sm:pb-[30px] md:pb-[47px]">
              <div className="mt-5">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-x-[19px] md:gap-x-11"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Home" />
                            </FormControl>
                            <FormLabel className="font-normal text-[13px] md:text-lg">
                              Home
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Work" />
                            </FormControl>
                            <FormLabel className="font-normal text-[13px] md:text-lg">
                              Work
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div> */}
              <FormField
                control={form.control}
                name="isChecked"
                render={({ field }) => (
                  <FormItem className="flex gap-x-2.5 flex-row items-center  hidden !space-y-0 rounded-md mt-[19px] md:mt-[32px] item">
                    <FormControl className="!space-y-0">
                      <Checkbox
                        className="data-[state=checked]:bg-black p-3 rounded-none"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="pt-1 text-xs md:text-[13px] text-black font-normal">
                      Save my information for a faster checkout
                    </FormLabel>
                  </FormItem>
                )}
              />
            </form>
            {/* <div className="flex items-center justify-end gap-x-5 absolute bottom-0">
            <button
              className="bg-black text-white py-4 px-10 w-[200px]"
              type="submit"
              onClick={handleConfirmedSubmit}
            >
              Pay Now
            </button>
          </div> */}
          </Form>
        )}

        {/* <AddressConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmedSubmit}
        addressData={addressToConfirm}
      /> */}
      </div>
    );
  }
);

AddressForm.displayName = "AddressForm";

export default AddressForm;
