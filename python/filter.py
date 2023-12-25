def main():
  with open("python/pageviews_en.csv") as views:
    with open("python/pageviews_f.csv", "w") as out:
      out.write(" ".join(["title", "id", "views"]))
      out.write("\n")

      last_line_title = ""
      last_line_views = 0
      for line in views:
        line = line.split(" ")
        title = line[1]

        if ("(disabiguation)" in title or "List_of_" in title):
          continue
        
        try:
          num_views = int(line[4])
          if (last_line_title == title):
            last_line_views += num_views
          else:
            if (last_line_views >= 20000):
              out.write(" ".join([last_line_title, line[2], str(last_line_views)]) + "\n")
            last_line_title = title
            last_line_views = num_views
        except:
          # Failed to parse page views
          if (last_line_title != title):
            last_line_views = 0
            last_line_title = title
          continue

if (__name__ == "__main__"):
  main()
