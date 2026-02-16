import json
import os

# Define relative paths from the script's location
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
EVENTS_FILE = os.path.join(DATA_DIR, 'events.json')
MARQUEE_FILE = os.path.join(DATA_DIR, 'marquee.json')
CAROUSEL_FILE = os.path.join(DATA_DIR, 'carousel.json')

def load_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

def list_events(events, marquee_data, carousel_data):
    print("\n" + "="*80)
    print(f"{'#':<3} | {'STATUS':<12} | {'EVENT TITLE':<25} | {'M':<2} | {'C':<2} | {'SLOTS STATUS'}")
    print("-" * 80)
    
    for i, event in enumerate(events):
        eid = event.get('id')
        title = event.get('title', 'No Title')
        status = event.get('status', 'unknown').upper()
        
        # Check Marquee
        in_marquee = "✔" if any(m.get('id') == eid for m in marquee_data) else "✘"
        
        # Check Carousel (by ID or Alt text)
        in_carousel = "✔" if any(c.get('id') == eid or c.get('alt', '').lower() == title.lower() for c in carousel_data) else "✘"
        
        # Slots summary
        slots = event.get('bookingOptions', [])
        if not slots:
            slots_summary = "Single Link"
        else:
            slot_details = []
            for s in slots:
                time = s.get('time', '??')
                s_stat = s.get('status', 'available')
                slot_details.append(f"{time}({s_stat})")
            slots_summary = " | ".join(slot_details)
        
        print(f"{i + 1:<3} | {status:<12} | {title[:25]:<25} | {in_marquee:<2} | {in_carousel:<2} | {slots_summary}")
    print("="*80)
    print("M: In Marquee | C: In Carousel\n")

def manage_event_status(events_data, marquee_data, carousel_data):
    list_events(events_data, marquee_data, carousel_data)
    choice = input("\nEnter event number to manage (or 'b' to go back): ")
    if choice.lower() == 'b':
        return
    
    try:
        idx = int(choice) - 1
        event = events_data[idx]
    except (ValueError, IndexError):
        print("Invalid choice.")
        return

    print(f"\nManaging: {event['title']}")
    print(f"Current Status: {event['status']}")
    print("New Status Options:")
    print("1. Open (Upcoming)")
    print("2. Filling Fast (Upcoming)")
    print("3. Sold Out (Upcoming)")
    print("4. Closed (Move to Past Events)")
    print("5. Coming Soon (Upcoming)")
    print("6. Bookings Closed but keep in Upcoming")
    
    status_choice = input("Select new status (1-6): ")
    
    new_status = ""
    is_closed = False
    keep_upcoming = False
    
    if status_choice == '1': new_status = "open"
    elif status_choice == '2': new_status = "filling-fast"
    elif status_choice == '3': new_status = "sold-out"
    elif status_choice == '4': 
        new_status = "closed"
        is_closed = True
    elif status_choice == '5': new_status = "soon"
    elif status_choice == '6':
        new_status = "open" # Keep status as open for upcoming list
        is_closed = True
        keep_upcoming = True
    else:
        print("Invalid choice.")
        return

    # Update event status
    event['status'] = new_status
    
    if is_closed:
        event['bookingLink'] = None
        if 'bookingOptions' in event:
            for opt in event['bookingOptions']:
                opt['status'] = 'closed'
        
        if not keep_upcoming:
            # Remove from Marquee
            marquee_data = [m for m in marquee_data if m.get('id') != event['id']]
            
            # Remove from Carousel
            carousel_data = [
                c for c in carousel_data 
                if c.get('alt', '').lower() != event['title'].lower() and c.get('id') != event['id']
            ]
            print(f"Set {event['title']} to {new_status.upper()} (PAST). Removed from Marquee/Carousel.")
        else:
            print(f"Set {event['title']} to CLOSED but keeping in UPCOMING section.")
    else:
        # If opening or filling fast, check booking link
        if new_status in ["open", "filling-fast"]:
            if not event.get('bookingLink') or event['bookingLink'] == "null":
                link = input(f"Enter booking link for {event['title']}: ")
                event['bookingLink'] = link
            
            if 'bookingOptions' in event:
                for opt in event['bookingOptions']:
                    if opt.get('status') == 'closed':
                        opt['status'] = 'available' if new_status == 'open' else 'filling-fast'

        # Manage Marquee
        in_marquee = any(m.get('id') == event['id'] for m in marquee_data)
        if not in_marquee:
            add_m = input("Add to Marquee? (y/n): ")
            if add_m.lower() == 'y':
                text = input(f"Enter marquee text (e.g. • {event['title']} • {event['date']} •): ")
                marquee_data.append({"id": event['id'], "text": text})
        
        # Manage Carousel
        in_carousel = any(c.get('alt', '').lower() == event['title'].lower() for c in carousel_data)
        if not in_carousel:
            add_c = input("Add to Carousel? (y/n): ")
            if add_c.lower() == 'y':
                d_img = input(f"Enter desktop image path (current: {event.get('details', {}).get('detailsImage', {}).get('landscape', 'N/A')}): ")
                m_img = input(f"Enter mobile image path (current: {event['image']}): ")
                carousel_data.append({
                    "desktopImage": d_img,
                    "mobileImage": m_img,
                    "alt": event['title']
                })

    return events_data, marquee_data, carousel_data

def main():
    events_data = load_json(EVENTS_FILE)
    marquee_data = load_json(MARQUEE_FILE)
    carousel_data = load_json(CAROUSEL_FILE)

    while True:
        print("\n=== GLORIX Booking Manager ===")
        print("1. List Events & Status")
        print("2. Manage Event (Update Status, Marquee, Carousel)")
        print("3. Save and Exit")
        print("4. Exit without Saving")
        
        choice = input("\nSelect an option: ")
        
        if choice == '1':
            list_events(events_data, marquee_data, carousel_data)
        elif choice == '2':
            result = manage_event_status(events_data, marquee_data, carousel_data)
            if result:
                events_data, marquee_data, carousel_data = result
        elif choice == '3':
            save_json(EVENTS_FILE, events_data)
            save_json(MARQUEE_FILE, marquee_data)
            save_json(CAROUSEL_FILE, carousel_data)
            print("\n[SUCCESS] All data files updated!")
            break
        elif choice == '4':
            print("Exiting without saving.")
            break
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
