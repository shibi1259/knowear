"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import _ from "lodash";
import countries from "world-countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useRouter } from "next/navigation";

// Zod schema for form validation
const addressSchema = z.object({
  type: z.enum(["Home", "Work"]),
  firstname: z.string().min(1, "First name is required"),
  countryName: z.string().optional(),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  country: z.string().min(1, "Country is required"),
  additionalAddress: z.string().min(1, "Additional address is required"),
  refid: z.string().optional(),
  aptSuiteUnit: z.string().optional(),
  city: z.string().optional(),
  state: z.string().min(1, "State is required"),
  mobile: z.string().min(1, "Phone is required").max(15, "Phone number is too long"),
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
});

type AddressFormValues = z.infer<typeof addressSchema>;

const countryOptions = countries.map((country) => ({
  label: country.name.common,
  value: country.cca2,
  code: country.idd.root + (country.idd.suffixes?.[0] || ""),
})).sort((a: any, b: any) => a.label.localeCompare(b.label));

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
  getAddress?: () => void;
  address?: any;
  setCheckoutFormData?: React.Dispatch<React.SetStateAction<any>>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  user,
  getAddress,
  address,
  setCheckoutFormData,
}) => {
  const router =useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  const [currentMarker, setCurrentMarker] = useState<any | null>(
    null
  );
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const infoWindowRef = useRef<any>();
  const isFirstWatchCall = useRef(true); 

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "Home",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      companyName: "",
      countryName: "",
      additionalAddress: "",
      deliveryAddress: user?.deliveryAddress || "",
      aptSuiteUnit: "",
      city: "",
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
  
    // Close and clean up existing InfoWindow if it exists
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null; // Clear the reference
    }
  
    // Create new InfoWindow only once
    infoWindowRef.current = new window.google.maps.InfoWindow();
  
    const subscription = form.watch((value, { name }) => {
      if (name === "fullAddress") {
        const fullAddr = value?.fullAddress || "Location";
        infoWindowRef.current.setContent(`<div style="padding: 8px;">${fullAddr}</div>`);
        infoWindowRef.current.open(mapInstance, currentMarker);
      }
    });
  
    // Cleanup function
    return () => {
      subscription.unsubscribe();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null; // Clear the reference
      }
    };
  }, [form, mapInstance, currentMarker]);
  

  // Helper function to update address from place
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
      if (place?.name && typeof place?.name === "string" && 
          !fullAddress.toLowerCase().includes(place?.name.toLowerCase())) {
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
          } else if (!/^\d+$/.test(firstPart)) {  // Skip if it's just numbers
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
          }
        else  if (types.includes("street_number")) {
            addressParts.push(value);
          }
          else if (types.includes("route")) {
            addressParts.push(value);
          }
          
          else if (types.includes("postal_code")) {
            postalCode = value;
            addressParts.push(value);
          }
          else if (types.includes("sublocality_level_1")) {
            addressParts.push(value);
          }
          else if (types.includes("sublocality_level_2")) {
            addressParts.push(value);
          }
          else if (types.includes("locality")) {
            city = value;
            addressParts.push(value);
          }
          else if (types.includes("neighborhood")) {
            addressParts.push(value);
          }
          else if (types.includes("administrative_area_level_3")) {
            addressParts.push(value);
          }
          else if (types.includes("administrative_area_level_2")) {
            addressParts.push(value);
          }
          else if (types.includes("administrative_area_level_1")) {
            state = value;
            hasAdminLevel1 = true;
            form.setValue("state", value);
          }
          else if (types.includes("country")) {
            country = component.short_name;
            // addressParts.push(component.long_name);
          }
         
        });
      console.log("fdgdfgdfgfdgdfgdgf")
      console.log("place",isFirstWatchCall.current);
      
      if (isFirstWatchCall.current===true) {
        isFirstWatchCall.current = false; // Skip the first call
        console.log("the first call")
      } else {
        setSearchQuery(place?.formatted_address||'');
        console.log("the second call")
      }
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
          deliveryAddress = deliveryAddress.substring(aptSuiteUnit.length).trim();
          if (deliveryAddress.startsWith(",")) {
            deliveryAddress = deliveryAddress.substring(1).trim();
          }
        }
      
        // Ensure city is included
        if (city && !deliveryAddress.includes(city)) {
          deliveryAddress += deliveryAddress ? `, ${city}` : city;
        }
      }
     
      const selectedCountry = countryOptions.find(
        (c) => c.value === country
      );
      console.log("selectedCountry from map =============",selectedCountry)
      
      if (selectedCountry) {
        form.setValue("countryCode", selectedCountry.code);
        form.trigger("countryCode");
        form.setValue("countryName", selectedCountry.label);
        form.trigger("countryName");
      }
      console.log("country name from map --------> ",form.getValues("countryName"))
      form.setValue("state", state);
      form.setValue("country", country);
      form.setValue("postalCode", postalCode);
      form.setValue("fullAddress", fullAddress);
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
      // form.setValue("countryName", countryName);
      // form.setValue("countryName", countryNamew);
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
        // searchInputRef.current.value = fullAddress;
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

      console.log("country name final ---->", form.getValues("countryName"))
    },
    [form, mapInstance, currentMarker]
  );


  
    

  const initializeMap = useCallback(() => {
    if (mapRef.current && window.google) {
      // Get coordinates from address prop if available, or from form values, or use defaults
      const defaultLocation = {
        lat: address?.coordinates 
          ? parseFloat(address.coordinates.latitude)
          : (form.getValues("latitude") || 25.2048),
        lng: address?.coordinates 
          ? parseFloat(address.coordinates.longitude)
          : (form.getValues("longitude") || 55.2708),
      };
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: false,
        draggableCursor: 'pointer',
        draggingCursor: 'grabbing',
      });
  
      // Create a single info window instance that will be reused
      // const infoWindow = new window.google.maps.InfoWindow();
      
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Drag me to set location",
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
  
      // Immediately set the form values to ensure consistency
      form.setValue("latitude", defaultLocation.lat);
      form.setValue("longitude", defaultLocation.lng);
  
      // Format address display
      const formatAddress = (address: any) => {
        if (!address?.formatted_address) return "Address not available";
        return address.formatted_address;
      };
  
      const updateAddress = (address: any) => {
        const cleanAddress = formatAddress(address);
        
        // setSearchQuery(cleanAddress);
        // Close any existing info window first
        // infoWindow.close();
        // // Set new content and open at marker position
        // infoWindow.setContent(`<div style="padding: 8px;">${cleanAddress}</div>`);
        // infoWindow.open(map, marker);
      };
  
      const geocoder = new window.google.maps.Geocoder();
  
      // Function to handle geocoding
      const handleGeocode = (location: { lat: number; lng: number }) => {
        // Close existing info window and show loading state
        // infoWindow.close();
        // infoWindow.setContent('<div style="padding: 8px;">Loading address...</div>');
        // infoWindow.open(map, marker);
        
        geocoder.geocode(
          {
            location,
            region: "AE" // Bias results to UAE
          },
          (results: any, status: any) => {
            if (status === "OK" && results?.[0]) {
              updateAddress(results[0]);
              // Only update address from place if this is a new address (no existing address prop)
              // or if the user has moved the marker (manual update)
              if (!address || location.lat !== parseFloat(address.coordinates?.latitude) ||
                  location.lng !== parseFloat(address.coordinates?.longitude)) {
                updateAddressFromPlace(results[0]);
              }
            } else {
              // Close existing and show error
              // infoWindow.close();
              // infoWindow.setContent('<div style="padding: 8px;">Address not available</div>');
              // infoWindow.open(map, marker);
              toast({
                title: "Address not found",
                description: "Please try another location or enter manually",
                variant: "destructive",
              });
            }
          }
        );
      };
  
      // Initial geocode
      handleGeocode(defaultLocation);
  
      // Drag end listener for position updates
      marker.addListener("dragend", () => {
        isFirstWatchCall.current = false;
        const position = marker.getPosition();
        if (!position) return;
        const lat = position.lat();
        const lng = position.lng();
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
        handleGeocode({ lat, lng });
        
        
      });
  
      // Click listener for the map to move the marker
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        isFirstWatchCall.current = false;
        if (!e.latLng) return;
        
        // Move marker to clicked position
        marker.setPosition(e.latLng);
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        // Update form values
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
        
        // Geocode the new position
        handleGeocode({ lat, lng });
      });
  
      // Optional: Close info window when clicking on the map
      map.addListener("click", () => {
        infoWindowRef.current?.close();
      });
  
      setMapInstance(map);
      setCurrentMarker(marker);
      setMapLoaded(true);
    }
  }, [form, updateAddressFromPlace, address, toast]);

  // Load Google Maps script
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
          // console.log("place",place);
          
          setSearchQuery(place.formatted_address);

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
                  setSearchQuery(results[0].formatted_address);
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
    if (!address?.email && user) {
       form.setValue("email", user.email);
       form.setValue("firstname",user.name)
       form.trigger("email");
       form.trigger("firstname");
    };
    if (address?.email) {
      // Format address data to match form structure
      const formData = {
        type: address.type || "Home",
        firstname: address.firstname || "",
        lastname: address.lastname || "",
        email: address.email || "",
        companyName: address.companyName || "",
        countryName: address.countryName || "",
        additionalAddress: address.additionalAddress || "",
        deliveryAddress: address.deliveryAddress || "",
        aptSuiteUnit: address.aptSuiteUnit || "",
        city: address.city || "",
        state: address.state || "",
        mobile: address.mobile || "",
        postalCode: address.postalCode || "",
        deliveryInstruction: address.deliveryInstruction || "",
        isDefaultShipping: address.isDefaultShipping || false,
        isDefaultBilling: address.isDefaultBilling || false,
        isChecked: true,
        country: address.country || "AE",
        countryCode: address.countryCode || "+971",
        // Convert string coordinates to numbers for the map
        latitude: address.coordinates ? parseFloat(address.coordinates.latitude) : 25.2048,
        longitude: address.coordinates ? parseFloat(address.coordinates.longitude) : 55.2708,
      };
      form.reset(formData);
      
      // Update map position if map is initialized
      if (mapInstance && currentMarker && address.coordinates) {
        const position = {
          lat: parseFloat(address.coordinates.latitude),
          lng: parseFloat(address.coordinates.longitude)
        };
        
        mapInstance.setCenter(position);
        mapInstance.setZoom(17);
        currentMarker.setPosition(position);
        
        // Trigger reverse geocode to update address display in map
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results: any, status: any) => {
          if (status === "OK" && results?.[0]) {
            // Update info window but don't override the form values
            // const infoWindow = new window.google.maps.InfoWindow();
            // infoWindow.setContent(`<div style="padding: 8px;">${results[0].formatted_address}</div>`);
            // infoWindow.open(mapInstance, currentMarker);
          }
        });
      }
    }
  }, [address, form, mapInstance, currentMarker, user]);

  // Update country code when country changes
  // useEffect(() => {
  //   const selectedCountry = countryOptions.find(
  //     (c) => c.value === form.getValues("country")
  //   );
  //   if (selectedCountry) {
  //     form.setValue("countryCode", selectedCountry.code);
  //     form.setValue("countryName", selectedCountry.label);
  //     // console.log(se)
      
  //   }
  // }, [form.watch("country")]);

  // Debounce search
  const debouncedSearch = useCallback(
    _.debounce((query: string) => {
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

  const onSubmit = async (data: AddressFormValues) => {

    console.log(data,"data")

    try {
      const payload:any = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        mobile: data.mobile,
        type: data.type,
        companyName: data.companyName || '',
        countryCode: data.countryCode || '+971',
        aptSuiteUnit: data.aptSuiteUnit || '',
        streetAddress: data.additionalAddress || '',
        deliveryAddress: data.deliveryAddress,
        additionalAddress: data.additionalAddress || '',
        countryName: data.countryName || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        state: data.state,
        country: data.country,
        deliveryInstruction: data.deliveryInstruction || '',
        isDefaultShipping: data.isDefaultShipping || false,
        isDefaultBilling: data.isDefaultBilling || false,
        coordinates: {
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
        }
      };
      if (address?.refid) {
        payload.refid = address.refid;
      }
console.log(payload,"payload for country")
      const endpoint = address?.refid
        ? endpoints.updateAddress
        : endpoints.addAddress;


      const response = await api.post(endpoint, payload);

      if (response.data?.errorCode === 0) {
        if (getAddress) getAddress();
        if (setCheckoutFormData) {
          setCheckoutFormData((prev: any) => ({
            ...prev,
            address: payload,
          }));
        }
        toast({
          description: "Address saved successfully",
          variant: "success",
        });
        router.push("/profile");
        
      } else {
        toast({
          description: response.data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  }
  

  return (
    <div>
      <h4 className="font-medium text-xl md:font-semibold md:text-[22px] mb-2">
        Shipping Address
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Map Section */}
          <div className="pb-[27px] sm:pb-[30px] md:pb-[47px]">
            <div className="mb-4">
              <div className="flex justify-center mb-4">
                <button
                  onClick={getCurrentLocation}
                  className="flex items-center justify-center w-full bg-black text-white py-2 h-[50px] transition-colors"
                  type="button"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium text-[18px] leading-[20px]">
                    Use my current location
                  </span>
                </button>
              </div>
              <div
                ref={mapRef}
                className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-md mb-4"
              />
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
                <Search className="absolute left-3 w-[18px] h-[18px] top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-1/2  max-md:w-[90%] bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
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
             
            </div>
          </div>

          {/* Form Fields */}
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
                        placeholder="Enter delivery address"
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
                      <Input
                        type="hidden"
                        className="hidden"
                        {...field}
                      />
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
                        placeholder="Enter additional address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <div className="col-span-2 sm:col-span-1">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-normal">
                      Country / Region*
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        const selectedCountry = countryOptions.find(
                          (c) => c.value === value
                        );
                        if (selectedCountry) {
                          form.setValue("countryCode", selectedCountry.code);
                          form.setValue("countryName", selectedCountry.label);
                          form.setValue("mobile", '')
                          form.trigger("countryCode");
                          form.trigger("countryName");
                          form.trigger("mobile");

                          
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl className="flex h-10 w-full placeholder:text-[13px] md:placeholder:text-[14px] text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div> */}
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
          onValueChange={(value) => {
            console.log(value,"=================>>>value")
            
            field.onChange(value);
            const selectedCountry = countryOptions.find(
              (c) => c.value === value
            );
            console.log(selectedCountry,"selectedCountry")
            
            if (selectedCountry) {
              form.setValue("countryCode", selectedCountry.code);
              form.setValue("countryName", selectedCountry.label);
              form.setValue("mobile", '');
              form.trigger("countryCode");
              form.trigger("countryName");
              form.trigger("mobile");
            }
            
            console.log("countryName ==>",form.getValues("countryName"));
            
          }}
          value={field.value}
        >
          <FormControl className="flex h-10 w-full placeholder:text-[13px] md:placeholder:text-[14px] text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]">
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {countryOptions.map((country) => (
              <SelectItem key={country.value} value={country.value}>
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
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State*</FormLabel>
                  {form.getValues("country") === "AE" ? (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      Phone*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED] pl-[50px]"
                        placeholder="Phone"
                        left={`${form.getValues("countryCode")} |`}
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
                      First Name*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="First name"
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
              />
            </div>
          </div>
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
          <FormField
            control={form.control}
            name="isDefaultShipping"
            render={({ field }) => (
              <FormItem className="flex mb-4 gap-x-2.5 flex-row items-center !space-y-0 rounded-md mt-[19px] md:mt-[32px] item">
                <FormControl className="!space-y-0">
                  <Checkbox
                    className="data-[state=checked]:bg-black p-3 rounded-none"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="pt-1 text-xs md:text-[13px] text-black font-normal">
                  Set as default shipping address
                </FormLabel>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end gap-x-5">
            <button
              className="bg-black text-white py-4 px-10 w-[200px]"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddressForm;