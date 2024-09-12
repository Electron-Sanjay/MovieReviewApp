package dev.sanjay.movieApp.ControllerClass;

import dev.sanjay.movieApp.ModelClass.Review;
import dev.sanjay.movieApp.ServiceClass.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/reviews")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/{imdbId}/reviews")
    public ResponseEntity<Review> createReview(@RequestBody Map<String,String> payload){
        return new ResponseEntity<Review>(reviewService.createReview(payload.get("reviewBody"),payload.get("imdbId")), HttpStatus.CREATED);
    }
}
