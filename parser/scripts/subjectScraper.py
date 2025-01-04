import requests
from bs4 import BeautifulSoup
import json

def get_course_name(course_code):
    try:
        # URL of the webpage you want to post to
        url = 'https://cl.thapar.edu/view1.php'

        # Form data to be sent in the POST request
        form_data = {
            'ccode': course_code,
            'submit': ''
        }

        print(f"Sending POST request to the URL with course code {course_code}...")

        # Send a POST request to the webpage, ignoring SSL certificate verification
        response = requests.post(url, data=form_data, verify=False)

        print("POST request sent. Status code:", response.status_code)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the HTML content
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find the third <tr> element
            third_tr = soup.find_all('tr')[2]  # Index 2 for the third <tr>

            # Find the second <td> element within the third <tr>
            second_td = third_tr.find_all('td')[1]  # Index 1 for the second <td>

            # Print the text content of the second <td>
            course_name = second_td.text.strip()
            print("Course Name:", course_name)
            return course_name
        else:
            print('Failed to retrieve the webpage')
            return course_code
    except Exception as e:
        print(f"An error occurred: {e}")
        return course_code

def extract_course_codes(json_data):
    course_codes = set()  # Use a set to store unique course codes

    for section, schedule in json_data.items():
        for day, times in schedule.items():
            for time, details in times.items():
                course_code = details[0]
                for code in course_code.split('/'):
                    subjectCode = code[:-1] if code[-1] in 'LTP' else code
                    course_codes.add(subjectCode)

    return course_codes

def main():
    file_path = '../results(evenSem).json'

    with open(file_path, 'r') as file:
        json_data = json.load(file)

    course_codes = extract_course_codes(json_data)
    courses = {}
    for code in course_codes:
        course_name = get_course_name(code)
        courses[code] = course_name

    print(course_codes)

    with open('subjects(evenSem).json', 'w') as json_file:
        json.dump(courses, json_file, indent=4)

if __name__ == "__main__":
    main()
